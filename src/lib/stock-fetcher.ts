import YahooFinance from "yahoo-finance2";
import nikkei225Data from "../../data/nikkei225.json";

const yahooFinance = new YahooFinance();

export interface StockQuote {
  code: string;
  name: string;
  price: number | null;
  dividendYield: number | null;
  dividend: number | null;
  marketCap: number | null;
  per: number | null;
  pbr: number | null;
  sector: string | null;
}

/**
 * 日経225銘柄リストを取得
 */
export function getNikkei225List(): { code: string; name: string }[] {
  return nikkei225Data.stocks;
}

/**
 * 証券コードをYahoo Financeティッカーに変換（日本株は.T付与）
 */
export function toYahooTicker(code: string): string {
  return `${code}.T`;
}

// Yahoo Finance APIのレスポンス型
interface YahooQuoteResponse {
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  trailingAnnualDividendYield?: number;
  trailingAnnualDividendRate?: number;
  marketCap?: number;
  trailingPE?: number;
  priceToBook?: number;
}

/**
 * 単一銘柄の株価・配当データを取得
 */
export async function fetchStockQuote(code: string): Promise<StockQuote | null> {
  const ticker = toYahooTicker(code);
  const stockInfo = nikkei225Data.stocks.find((s) => s.code === code);

  try {
    const quote = (await yahooFinance.quote(ticker)) as YahooQuoteResponse;

    return {
      code,
      name: stockInfo?.name ?? quote.shortName ?? quote.longName ?? code,
      price: quote.regularMarketPrice ?? null,
      dividendYield: quote.trailingAnnualDividendYield
        ? quote.trailingAnnualDividendYield * 100
        : null,
      dividend: quote.trailingAnnualDividendRate ?? null,
      marketCap: quote.marketCap ?? null,
      per: quote.trailingPE ?? null,
      pbr: quote.priceToBook ?? null,
      sector: null,
    };
  } catch (error) {
    console.error(`Failed to fetch quote for ${ticker}:`, error);
    return null;
  }
}

/**
 * 複数銘柄の株価・配当データを一括取得
 */
export async function fetchStockQuotes(codes: string[]): Promise<StockQuote[]> {
  const results: StockQuote[] = [];

  // APIレート制限を考慮してバッチ処理
  const batchSize = 10;
  const delayMs = 500;

  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = codes.slice(i, i + batchSize);
    const promises = batch.map((code) => fetchStockQuote(code));
    const batchResults = await Promise.all(promises);

    for (const result of batchResults) {
      if (result) {
        results.push(result);
      }
    }

    // 次のバッチまで待機
    if (i + batchSize < codes.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * 全日経225銘柄のデータを取得
 */
export async function fetchAllNikkei225Quotes(): Promise<StockQuote[]> {
  const codes = getNikkei225List().map((s) => s.code);
  return fetchStockQuotes(codes);
}
