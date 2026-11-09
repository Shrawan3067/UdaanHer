# UdaanHer: Giving women wings to fly — Deployment & Operations Guide

This guide details local setup, database provisioning, environment configurations, and production deployment instructions for **UdaanHer** across Vercel (Frontend), Render / Railway (Backend), and **MongoDB Atlas** (Cloud Database).

---

## 1. Local Installation Instructions

### Prerequisites
- **Node.js**: v20+ or v22+ (`node -v`)
- **npm**: v10+ (`npm -v`)
- **MongoDB Atlas Cluster URI** (or local MongoDB Community v7.0+ running as replica set `rs0` on port 27017)

### Step 1: Clone Repository & Install Root Workspaces
```bash
git clone <repo-url>
cd SakhiSetu

# Install dependencies for both server and client workspaces
npm install
```

---

## 2. MongoDB Atlas Database Setup

### Option A: Provisioning on MongoDB Atlas (Recommended for Cloud / Staging / Production)
1. Sign in to your account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (e.g. Free Tier M0 or Shared Cluster).
3. **Database Access**: Create a database user (e.g. `udaanher_user`) with `readWriteAnyDatabase` or read/write privileges on `udaanher`.
4. **Network Access**: Under Security > Network Access, add `0.0.0.0/0` (Allow Access from Anywhere) or specify your backend hosting provider's IP range.
5. **Get Connection String**:
   - Click **Connect** > **Drivers** (Node.js).
   - Copy the SRV connection URI:
     `mongodb+srv://<username>:<password>@cluster0.<hash>.mongodb.net/udaanher?retryWrites=true&w=majority`

### Option B: Local MongoDB Replica Set (rs0) (For Offline Development)
Multi-document transactions require MongoDB to run with replica set enabled:
```bash
# Verify mongod configuration has replicaSet enabled (/usr/local/etc/mongod.conf):
# replication:
#   replSetName: rs0

# In mongosh:
rs.initiate()
```
Local connection string: `mongodb://127.0.0.1:27017/udaanher?replicaSet=rs0`

---

## 3. Environment Variables Configuration

### 3.1 Backend Environment (`server/.env`)
Create `server/.env` based on `server/.env.example`:

```bash
cp server/.env.example server/.env
```

| Variable | Description | Example Value |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` (or `production`) |
| `PORT` | Backend port | `5001` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `DATABASE_URL` | Primary MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.abcde.mongodb.net/udaanher?retryWrites=true&w=majority` |
| `DATABASE_URL_TEST` | Isolated MongoDB database for test suites | `mongodb+srv://user:pass@cluster0.abcde.mongodb.net/udaanher_test?retryWrites=true&w=majority` |
| `JWT_SECRET` | 32+ character key for JWT signing | `udaanher-super-secure-production-jwt-secret-key-32chars` |
| `JWT_ACCESS_EXPIRES_IN` | Token duration | `24h` |
| `OPENAI_API_KEY` | Official OpenAI API Key for Hindi summaries | `sk-proj-...` (optional, has built-in safe synthesis fallback) |
| `OPENAI_MODEL` | OpenAI Model | `gpt-4o-mini` |
| `TRUST_NAME` | Client Trust Name (Statutory Registration) | `UdaanHer Women Welfare & Empowerment Charitable Trust (Bhopal)` |
| `TRUST_ADDRESS` | Trust Registered Address | `Plot 14, Arera Hills, Bhopal, Madhya Pradesh - 462011` |
| `TRUST_PAN` | Trust PAN | `AAATC1234D` |
| `TRUST_80G_REGISTRATION` | Trust 80G Statutory Registration Number | `CIT(E)/BPL/80G/2021-22/A-1089` |
| `PDF_STORAGE_PROVIDER` | Receipt storage provider | `local` |
| `PDF_STORAGE_BUCKET` | Receipt storage directory | `storage/receipts` |

### 3.2 Frontend Environment (`client/.env`)
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api/v1
```
*(In production, set `VITE_API_URL` to your deployed backend URL, e.g. `https://udaanher-api.onrender.com/api/v1`)*

---

## 4. MongoDB Collections Initialization & Data Seeding

UdaanHer connects to MongoDB Atlas using the official native `mongodb` driver. Collections and performance indexes are automatically verified and initialized on startup.

```bash
# Seed Production-Ready Indian Welfare Schemes & Demonstration Data
npm run db:seed
```

### Seeding Test Database:
```bash
DATABASE_URL="mongodb+srv://user:pass@cluster0.abcde.mongodb.net/udaanher_test?retryWrites=true&w=majority" npm run db:seed
```

---

## 5. Development Run Commands

Run both client and server concurrently from the root directory:

```bash
# Run server & client concurrently
npm run dev

# Or run separately in two terminal tabs:
npm run dev:server   # Starts Express on http://localhost:5001
npm run dev:client   # Starts Vite on http://localhost:5173
```

Open your browser to [http://localhost:5173](http://localhost:5173).

---

## 6. Testing Commands

All unit, integration, and critical MongoDB transaction concurrency tests pass cleanly:

```bash
# Run all unit tests (Server and Client)
npm test

# Run Server Tests Only
npm run test:server

# Run MongoDB Transaction Concurrency Tests (Atomic receipt allocation under load)
npm --prefix server run test:concurrency

# Run Client Tests
npm run test:client
```

---

## 7. Production Deployment (Vercel + Render + MongoDB Atlas)

### 7.1 Database on MongoDB Atlas
1. Follow Section 2 to create your cluster and get the `mongodb+srv://...` URI.
2. In your local terminal or CI/CD pipeline, seed the baseline dataset:
   ```bash
   DATABASE_URL="mongodb+srv://user:pass@cluster0.abcde.mongodb.net/udaanher?retryWrites=true&w=majority" npm run db:seed
   ```

### 7.2 Backend on Render / Railway
1. Create a new **Web Service** pointing to the GitHub repository.
2. Root Directory: `server`
3. Environment: `Node.js`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your MongoDB Atlas `mongodb+srv://...` connection string
   - `JWT_SECRET`: Random 32+ character hex string
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://udaanher.vercel.app`)
   - `OPENAI_API_KEY`: Your OpenAI key
   - `OPENAI_MODEL`: `gpt-4o-mini`
   - `TRUST_NAME`, `TRUST_ADDRESS`, `TRUST_PAN`, `TRUST_80G_REGISTRATION`

### 7.3 Frontend on Vercel
1. Import your GitHub repository in Vercel.
2. Root Directory: `client`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com/api/v1`
7. Click **Deploy**.

---

## 8. Demo Accounts & Credentials

Use these documented accounts to demonstrate all role-based journeys:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Trust Administrator** | `admin@udaanher.org` | `Admin@123456` | Access admin dashboard, manage schemes, review AI drafts, view donations, export Form 10BD CSV. |
| **Donor 1 (Priya Sharma)** | `priya.sharma@example.com` | `Donor@123456` | View personal donation history, download 80G PDF receipts. |
| **Donor 2 (Rajesh Patel)** | `rajesh.patel@example.com` | `Donor@123456` | View personal recurring donation simulation, download receipts. |
| **Public Visitor** | *(No login required)* | — | Browse schemes, filter by district, run eligibility calculator, make test donations. |

*Quick-fill buttons are provided on the Login page for instant one-click demonstration.*

---

## 9. Troubleshooting & Operations

### Issue: Multi-Document Transaction requires replica set
- Multi-document transactions require MongoDB to run as a replica set.
- **MongoDB Atlas** has replica sets enabled by default across all tiers (including M0 Free Tier).
- If running locally, enable replica set in `/usr/local/etc/mongod.conf` (`replication: replSetName: rs0`) and run `rs.initiate()`.

### Issue: Write Conflicts under heavy concurrency (`P2034`)
- High-concurrency operations on shared documents (e.g. `ReceiptSequence`) use `withTransactionRetry` with exponential backoff and jitter (`server/src/utils/transaction-retry.ts`) to automatically resolve MongoDB optimistic lock conflicts.

### Issue: MongoDB Atlas IP Access Block (`ECONNREFUSED` / `Whitelisting`)
- Ensure your IP or hosting provider is listed under MongoDB Atlas > Network Access. Use `0.0.0.0/0` during development/take-home evaluation.
