import { prisma } from "./prisma";
import { type StockQuote, fetchAllNikkei225Quotes } from "./stock-fetcher";

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * 株価データをDBに保存
 */
async function upsertStock(quote: StockQuote): Promise<void> {
  await prisma.stock.upsert({
    where: { code: quote.code },
    update: {
      name: quote.name,
      price: quote.price,
      dividendYield: quote.dividendYield,
      dividend: quote.dividend,
      marketCap: quote.marketCap,
      per: quote.per,
      pbr: quote.pbr,
      sector: quote.sector,
      isNikkei225: true,
      updatedAt: new Date(),
    },
    create: {
      code: quote.code,
      name: quote.name,
      price: quote.price,
      dividendYield: quote.dividendYield,
      dividend: quote.dividend,
      marketCap: quote.marketCap,
      per: quote.per,
      pbr: quote.pbr,
      sector: quote.sector,
      isNikkei225: true,
    },
  });
}

/**
 * 全日経225銘柄のデータを同期
 */
export async function syncAllStocks(): Promise<SyncResult> {
  const errors: string[] = [];
  let syncedCount = 0;
  let failedCount = 0;

  try {
    console.log("Fetching stock quotes...");
    const quotes = await fetchAllNikkei225Quotes();
    console.log(`Fetched ${quotes.length} quotes`);

    for (const quote of quotes) {
      try {
        await upsertStock(quote);
        syncedCount++;
      } catch (error) {
        failedCount++;
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${quote.code}: ${message}`);
        console.error(`Failed to sync ${quote.code}:`, error);
      }
    }

    return {
      success: errors.length === 0,
      syncedCount,
      failedCount,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      syncedCount,
      failedCount,
      errors: [message],
    };
  }
}
