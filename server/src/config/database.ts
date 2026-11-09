/**
 * UdaanHer Native MongoDB Atlas Database Layer
 * Giving women wings to fly
 * Native MongoDB Node.js driver (mongodb).
 */
import { MongoClient, Db, ClientSession, Document } from "mongodb";
import crypto from "crypto";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";
import {
  User,
  Campaign,
  Scheme,
  Donation,
  Payment,
  Receipt,
  ReceiptSequence,
  AIReview,
  AuditLog,
  HelpRequest,
} from "../types/models.js";

const connectionUri =
  env.NODE_ENV === "test" && env.DATABASE_URL_TEST
    ? env.DATABASE_URL_TEST
    : env.DATABASE_URL;

class MongoAtlasClient {
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected = false;
  private connectPromise: Promise<Db> | null = null;

  constructor() {
    this.client = new MongoClient(connectionUri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      retryWrites: true,
      w: "majority",
    });
  }

  async getDb(): Promise<Db> {
    if (this.db && this.isConnected) {
      return this.db;
    }
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = (async () => {
      try {
        await this.client.connect();
        this.isConnected = true;
        this.db = this.client.db();
        logger.info(" Connected to MongoDB Atlas Cloud Database", {
          database: this.db.databaseName,
        });

        // Initialize indexes in background
        this.initIndexes(this.db).catch((err) => {
          logger.warn("Index initialization notice:", { error: err.message });
        });

        return this.db;
      } catch (err: any) {
        this.isConnected = false;
        this.connectPromise = null;
        logger.error("Failed to connect to MongoDB Atlas:", err);
        throw err;
      }
    })();

    return this.connectPromise;
  }

  private async initIndexes(database: Db) {
    try {
      await Promise.allSettled([
        database
          .collection("users")
          .createIndex({ email: 1 }, { unique: true }),
        database
          .collection("campaigns")
          .createIndex({ slug: 1 }, { unique: true }),
        database
          .collection("schemes")
          .createIndex({ slug: 1 }, { unique: true }),
        database
          .collection("schemes")
          .createIndex({ schemeCode: 1 }, { unique: true }),
        database.collection("schemes").createIndex({ status: 1, category: 1 }),
        database
          .collection("donations")
          .createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true }),
        database.collection("donations").createIndex({ donorId: 1 }),
        database.collection("donations").createIndex({ campaignId: 1 }),
        database
          .collection("donations")
          .createIndex({ status: 1, createdAt: -1 }),
        database
          .collection("payments")
          .createIndex({ transactionReference: 1 }, { unique: true }),
        database.collection("payments").createIndex({ donationId: 1 }),
        database
          .collection("receipts")
          .createIndex({ receiptNumber: 1 }, { unique: true }),
        database
          .collection("receipts")
          .createIndex({ donationId: 1 }, { unique: true }),
        database.collection("receipts").createIndex({ financialYear: 1 }),
        database
          .collection("receipt_sequences")
          .createIndex({ financialYear: 1 }, { unique: true }),
        database.collection("ai_reviews").createIndex({ schemeId: 1 }),
        database.collection("ai_reviews").createIndex({ status: 1 }),
        database
          .collection("help_requests")
          .createIndex({ status: 1, createdAt: -1 }),
      ]);
    } catch {
      // Ignored for existing indexes
    }
  }

  async $disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      this.db = null;
      this.connectPromise = null;
      logger.info("MongoDB Atlas client disconnected");
    }
  }

  async $runCommandRaw(command: Document): Promise<Document> {
    const database = await this.getDb();
    return database.command(command);
  }

  /**
   * Multi-document replica set transaction support using native MongoDB sessions
   */
  async $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    await this.getDb();
    const session = this.client.startSession();

    try {
      let result: T | undefined;
      await session.withTransaction(
        async () => {
          result = await fn(this.createTransactionalAdapter(session));
        },
        {
          readPreference: "primary",
          readConcern: { level: "local" },
          writeConcern: { w: "majority" },
        },
      );
      return result as T;
    } catch (err: any) {
      // If transactions fail due to non-replica set or driver error, run without session
      if (
        err.message?.includes("replica set") ||
        err.message?.includes("Transaction")
      ) {
        return await fn(this);
      }
      throw err;
    } finally {
      await session.endSession();
    }
  }

  private normalizeDoc(doc: any): any {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return {
      id: doc.id || _id?.toString(),
      ...rest,
    };
  }

  private buildMongoQuery(where: any): any {
    if (!where) return {};
    const query: any = {};

    for (const [key, value] of Object.entries(where)) {
      if (key === "id") {
        query.$or = [{ id: value }, { _id: value }];
      } else if (key === "OR" && Array.isArray(value)) {
        query.$or = value.map((subWhere) => this.buildMongoQuery(subWhere));
      } else if (key === "AND" && Array.isArray(value)) {
        query.$and = value.map((subWhere) => this.buildMongoQuery(subWhere));
      } else if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        const valObj = value as any;
        if ("contains" in valObj) {
          query[key] = {
            $regex: new RegExp(
              valObj.contains,
              valObj.mode === "insensitive" ? "i" : "",
            ),
          };
        } else if ("startsWith" in valObj) {
          query[key] = {
            $regex: new RegExp(
              `^${valObj.startsWith}`,
              valObj.mode === "insensitive" ? "i" : "",
            ),
          };
        } else if ("equals" in valObj) {
          if (valObj.mode === "insensitive") {
            query[key] = { $regex: new RegExp(`^${valObj.equals}$`, "i") };
          } else {
            query[key] = valObj.equals;
          }
        } else if ("has" in valObj) {
          query[key] = valObj.has;
        } else if ("in" in valObj) {
          query[key] = { $in: valObj.in };
        } else {
          query[key] = value;
        }
      } else {
        query[key] = value;
      }
    }

    return query;
  }

  private buildSort(orderBy: any): any {
    if (!orderBy) return { createdAt: -1 };
    if (Array.isArray(orderBy)) {
      const sort: any = {};
      for (const item of orderBy) {
        for (const [k, v] of Object.entries(item)) {
          sort[k] = v === "desc" ? -1 : 1;
        }
      }
      return sort;
    }
    const sort: any = {};
    for (const [k, v] of Object.entries(orderBy)) {
      sort[k] = v === "desc" ? -1 : 1;
    }
    return sort;
  }

  private createTransactionalAdapter(session: ClientSession) {
    return {
      user: this.createUserRepo(session),
      campaign: this.createCampaignRepo(session),
      scheme: this.createSchemeRepo(session),
      donation: this.createDonationRepo(session),
      payment: this.createPaymentRepo(session),
      receipt: this.createReceiptRepo(session),
      receiptSequence: this.createReceiptSequenceRepo(session),
      aIReview: this.createAIReviewRepo(session),
      auditLog: this.createAuditLogRepo(session),
      helpRequest: this.createHelpRequestRepo(session),
    };
  }

  // Repositories
  private createUserRepo(session?: ClientSession) {
    return {
      findUnique: async (args: { where: any; select?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const doc = await database
          .collection("users")
          .findOne(query, { session });
        return this.normalizeDoc(doc);
      },
      findFirst: async (args?: { where?: any; select?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const doc = await database
          .collection("users")
          .findOne(query, { session });
        return this.normalizeDoc(doc);
      },
      findMany: async (args?: {
        where?: any;
        orderBy?: any;
        take?: number;
        skip?: number;
      }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const cursor = database.collection("users").find(query, { session });
        if (args?.orderBy) cursor.sort(this.buildSort(args.orderBy));
        if (args?.skip) cursor.skip(args.skip);
        if (args?.take) cursor.limit(args.take);
        const docs = await cursor.toArray();
        return docs.map((d) => this.normalizeDoc(d));
      },
      create: async (args: { data: any; select?: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const now = new Date();
        const record = {
          _id: id,
          id,
          isActive: true,
          ...args.data,
          createdAt: args.data.createdAt || now,
          updatedAt: now,
        };
        await database.collection("users").insertOne(record, { session });
        return this.normalizeDoc(record);
      },
      update: async (args: { where: any; data: any; select?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const now = new Date();
        await database
          .collection("users")
          .updateOne(
            query,
            { $set: { ...args.data, updatedAt: now } },
            { session },
          );
        const updated = await database
          .collection("users")
          .findOne(query, { session });
        return this.normalizeDoc(updated);
      },
      count: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("users").countDocuments(query, { session });
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("users").deleteMany(query, { session });
      },
    };
  }

  private createCampaignRepo(session?: ClientSession) {
    return {
      findUnique: async (args: { where: any; include?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const doc = await database
          .collection("campaigns")
          .findOne(query, { session });
        const normalized = this.normalizeDoc(doc);
        if (normalized && args.include?._count) {
          const donorCount = await database
            .collection("donations")
            .countDocuments(
              { campaignId: normalized.id, status: "SUCCESS" },
              { session },
            );
          normalized._count = { donations: donorCount };
        }
        return normalized;
      },
      findFirst: async (args?: { where?: any; include?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const doc = await database
          .collection("campaigns")
          .findOne(query, { session });
        return this.normalizeDoc(doc);
      },
      findMany: async (args?: {
        where?: any;
        orderBy?: any;
        include?: any;
        select?: any;
      }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const cursor = database
          .collection("campaigns")
          .find(query, { session });
        if (args?.orderBy) cursor.sort(this.buildSort(args.orderBy));
        const docs = await cursor.toArray();
        const normalized = docs.map((d) => this.normalizeDoc(d));

        if (args?.include?._count) {
          for (const c of normalized) {
            const count = await database
              .collection("donations")
              .countDocuments(
                { campaignId: c.id, status: "SUCCESS" },
                { session },
              );
            c._count = { donations: count };
          }
        }
        return normalized;
      },
      create: async (args: { data: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const now = new Date();
        const record = {
          _id: id,
          id,
          collectedAmount: 0,
          status: "ACTIVE",
          ...args.data,
          createdAt: args.data.createdAt || now,
          updatedAt: now,
        };
        await database.collection("campaigns").insertOne(record, { session });
        return this.normalizeDoc(record);
      },
      update: async (args: { where: any; data: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const now = new Date();
        const updateOps: any = { $set: { updatedAt: now } };

        for (const [key, val] of Object.entries(args.data)) {
          if (val && typeof val === "object" && "increment" in (val as any)) {
            updateOps.$inc = updateOps.$inc || {};
            updateOps.$inc[key] = (val as any).increment;
          } else {
            updateOps.$set[key] = val;
          }
        }

        await database
          .collection("campaigns")
          .updateOne(query, updateOps, { session });
        const updated = await database
          .collection("campaigns")
          .findOne(query, { session });
        return this.normalizeDoc(updated);
      },
      count: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database
          .collection("campaigns")
          .countDocuments(query, { session });
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("campaigns").deleteMany(query, { session });
      },
    };
  }

  private createSchemeRepo(session?: ClientSession) {
    return {
      findUnique: async (args: { where: any; include?: any; select?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const doc = await database
          .collection("schemes")
          .findOne(query, { session });
        const normalized = this.normalizeDoc(doc);
        if (normalized && args.include?.aiReviews) {
          const reviews = await database
            .collection("ai_reviews")
            .find({ schemeId: normalized.id }, { session })
            .toArray();
          normalized.aiReviews = reviews.map((r) => this.normalizeDoc(r));
        }
        return normalized;
      },
      findFirst: async (args?: { where?: any; include?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const doc = await database
          .collection("schemes")
          .findOne(query, { session });
        return this.normalizeDoc(doc);
      },
      findMany: async (args?: {
        where?: any;
        orderBy?: any;
        skip?: number;
        take?: number;
        select?: any;
      }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const cursor = database.collection("schemes").find(query, { session });
        if (args?.orderBy) cursor.sort(this.buildSort(args.orderBy));
        if (args?.skip) cursor.skip(args.skip);
        if (args?.take) cursor.limit(args.take);
        const docs = await cursor.toArray();
        return docs.map((d) => this.normalizeDoc(d));
      },
      count: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database
          .collection("schemes")
          .countDocuments(query, { session });
      },
      create: async (args: { data: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const now = new Date();
        const record = {
          _id: id,
          id,
          status: "PUBLISHED",
          lastCheckedAt: args.data.lastCheckedAt || now,
          ...args.data,
          createdAt: args.data.createdAt || now,
          updatedAt: now,
        };
        await database.collection("schemes").insertOne(record, { session });
        return this.normalizeDoc(record);
      },
      update: async (args: { where: any; data: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const now = new Date();
        await database
          .collection("schemes")
          .updateOne(
            query,
            { $set: { ...args.data, updatedAt: now } },
            { session },
          );
        const updated = await database
          .collection("schemes")
          .findOne(query, { session });
        return this.normalizeDoc(updated);
      },
      delete: async (args: { where: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const doc = await database
          .collection("schemes")
          .findOne(query, { session });
        await database.collection("schemes").deleteOne(query, { session });
        return this.normalizeDoc(doc);
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("schemes").deleteMany(query, { session });
      },
    };
  }

  private createDonationRepo(session?: ClientSession) {
    return {
      findUnique: async (args: { where: any; include?: any; select?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const doc = await database
          .collection("donations")
          .findOne(query, { session });
        const normalized = this.normalizeDoc(doc);
        if (!normalized) return null;

        if (args.include?.campaign) {
          const campaign = await database
            .collection("campaigns")
            .findOne({ id: normalized.campaignId }, { session });
          normalized.campaign = this.normalizeDoc(campaign);
        }
        if (args.include?.receipt) {
          const receipt = await database
            .collection("receipts")
            .findOne({ donationId: normalized.id }, { session });
          normalized.receipt = this.normalizeDoc(receipt);
        }
        if (args.include?.payments) {
          const payments = await database
            .collection("payments")
            .find({ donationId: normalized.id }, { session })
            .toArray();
          normalized.payments = payments.map((p) => this.normalizeDoc(p));
        }
        return normalized;
      },
      findFirst: async (args?: { where?: any; include?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const doc = await database
          .collection("donations")
          .findOne(query, { session });
        return this.normalizeDoc(doc);
      },
      findMany: async (args?: {
        where?: any;
        orderBy?: any;
        skip?: number;
        take?: number;
        include?: any;
        select?: any;
      }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const cursor = database
          .collection("donations")
          .find(query, { session });
        if (args?.orderBy) cursor.sort(this.buildSort(args.orderBy));
        if (args?.skip) cursor.skip(args.skip);
        if (args?.take) cursor.limit(args.take);
        const docs = await cursor.toArray();
        const normalized = docs.map((d) => this.normalizeDoc(d));

        if (args?.include) {
          for (const d of normalized) {
            if (args.include.campaign) {
              const campaign = await database
                .collection("campaigns")
                .findOne({ id: d.campaignId }, { session });
              d.campaign = this.normalizeDoc(campaign);
            }
            if (args.include.receipt) {
              const receipt = await database
                .collection("receipts")
                .findOne({ donationId: d.id }, { session });
              d.receipt = this.normalizeDoc(receipt);
            }
          }
        }
        return normalized;
      },
      count: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database
          .collection("donations")
          .countDocuments(query, { session });
      },
      aggregate: async (args: { where?: any; _sum?: { amount?: boolean } }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const result = await database
          .collection("donations")
          .aggregate(
            [
              { $match: query },
              { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
            ],
            { session },
          )
          .toArray();

        return {
          _sum: {
            amount: result[0]?.totalAmount || 0,
          },
        };
      },
      create: async (args: { data: any; include?: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const now = new Date();
        const record = {
          _id: id,
          id,
          currency: "INR",
          status: "PENDING",
          ...args.data,
          createdAt: args.data.createdAt || now,
          updatedAt: now,
        };
        await database.collection("donations").insertOne(record, { session });
        const normalized = this.normalizeDoc(record);

        if (args.include?.campaign) {
          const campaign = await database
            .collection("campaigns")
            .findOne({ id: normalized.campaignId }, { session });
          normalized.campaign = this.normalizeDoc(campaign);
        }
        return normalized;
      },
      update: async (args: { where: any; data: any; include?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const now = new Date();
        await database
          .collection("donations")
          .updateOne(
            query,
            { $set: { ...args.data, updatedAt: now } },
            { session },
          );
        const updated = await database
          .collection("donations")
          .findOne(query, { session });
        const normalized = this.normalizeDoc(updated);

        if (normalized && args.include?.campaign) {
          const campaign = await database
            .collection("campaigns")
            .findOne({ id: normalized.campaignId }, { session });
          normalized.campaign = this.normalizeDoc(campaign);
        }
        return normalized;
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("donations").deleteMany(query, { session });
      },
    };
  }

  private createPaymentRepo(session?: ClientSession) {
    return {
      findUnique: async (args: { where: any; include?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const doc = await database
          .collection("payments")
          .findOne(query, { session });
        const normalized = this.normalizeDoc(doc);
        if (normalized && args.include?.donation) {
          const donation = await database
            .collection("donations")
            .findOne({ id: normalized.donationId }, { session });
          normalized.donation = this.normalizeDoc(donation);
        }
        return normalized;
      },
      create: async (args: { data: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const now = new Date();
        const record = {
          _id: id,
          id,
          provider: "MOCK_PAYMENT_SIMULATOR",
          ...args.data,
          createdAt: args.data.createdAt || now,
        };
        await database.collection("payments").insertOne(record, { session });
        return this.normalizeDoc(record);
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("payments").deleteMany(query, { session });
      },
    };
  }

  private createReceiptRepo(session?: ClientSession) {
    return {
      findUnique: async (args: { where: any; include?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const doc = await database
          .collection("receipts")
          .findOne(query, { session });
        const normalized = this.normalizeDoc(doc);
        if (!normalized) return null;

        if (args.include?.donation) {
          const donation = await database
            .collection("donations")
            .findOne({ id: normalized.donationId }, { session });
          normalized.donation = this.normalizeDoc(donation);

          if (normalized.donation && args.include.donation.include?.campaign) {
            const campaign = await database
              .collection("campaigns")
              .findOne({ id: normalized.donation.campaignId }, { session });
            normalized.donation.campaign = this.normalizeDoc(campaign);
          }
        }
        return normalized;
      },
      findMany: async (args?: {
        where?: any;
        orderBy?: any;
        include?: any;
      }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const cursor = database.collection("receipts").find(query, { session });
        if (args?.orderBy) cursor.sort(this.buildSort(args.orderBy));
        const docs = await cursor.toArray();
        const normalized = docs.map((d) => this.normalizeDoc(d));

        if (args?.include?.donation) {
          for (const r of normalized) {
            const donation = await database
              .collection("donations")
              .findOne({ id: r.donationId }, { session });
            r.donation = this.normalizeDoc(donation);

            if (
              r.donation &&
              (args.include.donation === true ||
                args.include.donation.include?.campaign)
            ) {
              const campaign = await database
                .collection("campaigns")
                .findOne({ id: r.donation.campaignId }, { session });
              r.donation.campaign = this.normalizeDoc(campaign);
            }
          }
        }
        return normalized;
      },
      create: async (args: { data: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const now = new Date();
        const record = {
          _id: id,
          id,
          ...args.data,
          issuedAt: args.data.issuedAt || now,
        };
        await database.collection("receipts").insertOne(record, { session });
        return this.normalizeDoc(record);
      },
      count: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("receipts").countDocuments(query, { session });
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("receipts").deleteMany(query, { session });
      },
    };
  }

  private createReceiptSequenceRepo(session?: ClientSession) {
    return {
      findUnique: async (args: { where: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const doc = await database
          .collection("receipt_sequences")
          .findOne(query, { session });
        return this.normalizeDoc(doc);
      },
      create: async (args: { data: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const now = new Date();
        const record = {
          _id: id,
          id,
          ...args.data,
          updatedAt: now,
        };
        await database
          .collection("receipt_sequences")
          .insertOne(record, { session });
        return this.normalizeDoc(record);
      },
      upsert: async (args: {
        where: { financialYear: string };
        update: any;
        create: any;
      }) => {
        const database = await this.getDb();
        const now = new Date();
        const fy = args.where.financialYear;

        // Atomically increment using MongoDB findOneAndUpdate
        const res = await database
          .collection("receipt_sequences")
          .findOneAndUpdate(
            { financialYear: fy },
            {
              $inc: { nextNumber: 1 },
              $setOnInsert: {
                _id: crypto.randomUUID(),
                id: crypto.randomUUID(),
                financialYear: fy,
              },
              $set: { updatedAt: now },
            },
            {
              upsert: true,
              returnDocument: "after",
              session,
            },
          );

        return this.normalizeDoc(res);
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database
          .collection("receipt_sequences")
          .deleteMany(query, { session });
      },
    };
  }

  private createAIReviewRepo(session?: ClientSession) {
    return {
      findUnique: async (args: { where: any; include?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const doc = await database
          .collection("ai_reviews")
          .findOne(query, { session });
        const normalized = this.normalizeDoc(doc);
        if (normalized && args.include?.scheme) {
          const scheme = await database
            .collection("schemes")
            .findOne({ id: normalized.schemeId }, { session });
          normalized.scheme = this.normalizeDoc(scheme);
        }
        return normalized;
      },
      findMany: async (args?: {
        where?: any;
        orderBy?: any;
        include?: any;
      }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const cursor = database
          .collection("ai_reviews")
          .find(query, { session });
        if (args?.orderBy) cursor.sort(this.buildSort(args.orderBy));
        const docs = await cursor.toArray();
        const normalized = docs.map((d) => this.normalizeDoc(d));

        if (args?.include?.scheme) {
          for (const rev of normalized) {
            const scheme = await database
              .collection("schemes")
              .findOne({ id: rev.schemeId }, { session });
            rev.scheme = this.normalizeDoc(scheme);
          }
        }
        return normalized;
      },
      create: async (args: { data: any; include?: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const now = new Date();
        const record = {
          _id: id,
          id,
          status: "PENDING",
          ...args.data,
          createdAt: args.data.createdAt || now,
          updatedAt: now,
        };
        await database.collection("ai_reviews").insertOne(record, { session });
        const normalized = this.normalizeDoc(record);

        if (args.include?.scheme) {
          const scheme = await database
            .collection("schemes")
            .findOne({ id: normalized.schemeId }, { session });
          normalized.scheme = this.normalizeDoc(scheme);
        }
        return normalized;
      },
      update: async (args: { where: any; data: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args.where);
        const now = new Date();
        await database
          .collection("ai_reviews")
          .updateOne(
            query,
            { $set: { ...args.data, updatedAt: now } },
            { session },
          );
        const updated = await database
          .collection("ai_reviews")
          .findOne(query, { session });
        return this.normalizeDoc(updated);
      },
      count: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database
          .collection("ai_reviews")
          .countDocuments(query, { session });
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("ai_reviews").deleteMany(query, { session });
      },
    };
  }

  private createAuditLogRepo(session?: ClientSession) {
    return {
      findMany: async (args?: {
        where?: any;
        orderBy?: any;
        take?: number;
        skip?: number;
      }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        const cursor = database.collection("audit_logs").find(query, { session });
        if (args?.orderBy) cursor.sort(this.buildSort(args.orderBy));
        if (args?.skip) cursor.skip(args.skip);
        if (args?.take) cursor.limit(args.take);
        const docs = await cursor.toArray();
        return docs.map((d) => this.normalizeDoc(d));
      },
      count: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("audit_logs").countDocuments(query, { session });
      },
      create: async (args: { data: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const record = {
          _id: id,
          id,
          ...args.data,
          createdAt: new Date(),
        };
        await database.collection("audit_logs").insertOne(record, { session });
        return this.normalizeDoc(record);
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database.collection("audit_logs").deleteMany(query, { session });
      },
    };
  }

  private createHelpRequestRepo(session?: ClientSession) {
    return {
      create: async (args: { data: any }) => {
        const database = await this.getDb();
        const id = args.data.id || crypto.randomUUID();
        const now = new Date();
        const record = {
          _id: id,
          id,
          status: "PENDING",
          ...args.data,
          createdAt: now,
          updatedAt: now,
        };
        await database
          .collection("help_requests")
          .insertOne(record, { session });
        return this.normalizeDoc(record);
      },
      deleteMany: async (args?: { where?: any }) => {
        const database = await this.getDb();
        const query = this.buildMongoQuery(args?.where);
        return database
          .collection("help_requests")
          .deleteMany(query, { session });
      },
    };
  }

  // Direct repo getters on client instance
  get user() {
    return this.createUserRepo();
  }
  get campaign() {
    return this.createCampaignRepo();
  }
  get scheme() {
    return this.createSchemeRepo();
  }
  get donation() {
    return this.createDonationRepo();
  }
  get payment() {
    return this.createPaymentRepo();
  }
  get receipt() {
    return this.createReceiptRepo();
  }
  get receiptSequence() {
    return this.createReceiptSequenceRepo();
  }
  get aIReview() {
    return this.createAIReviewRepo();
  }
  get auditLog() {
    return this.createAuditLogRepo();
  }
  get helpRequest() {
    return this.createHelpRequestRepo();
  }
}

// Global Singleton pattern across development reloads
declare global {
  // eslint-disable-next-line no-var
  var mongoAtlasInstance: undefined | MongoAtlasClient;
}

export const prisma = globalThis.mongoAtlasInstance ?? new MongoAtlasClient();
export const db = prisma;

if (env.NODE_ENV !== "production") {
  globalThis.mongoAtlasInstance = prisma;
}
