/**
 * Concurrency Transaction Retry Helper for MongoDB Replica Sets.
 * Automatically retries transactions that encounter write conflicts under heavy concurrency.
 */
export async function withTransactionRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 10,
  baseDelayMs: number = 25
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      const isWriteConflict =
        err?.code === 'P2034' ||
        err?.message?.includes('write conflict') ||
        err?.message?.includes('deadlock') ||
        err?.message?.includes('Transaction failed due to a write conflict');

      if (isWriteConflict && attempt <= maxRetries) {
        const jitter = Math.floor(Math.random() * 30);
        const delay = baseDelayMs * Math.pow(1.5, attempt - 1) + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

