import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoistedでモック関数を先に定義（vi.mockより先に実行される）
const mockQuoteFn = vi.hoisted(() => vi.fn());

// yahoo-finance2をモック（クラスコンストラクタとして）
vi.mock("yahoo-finance2", () => ({
  default: class MockYahooFinance {
    quote = mockQuoteFn;
  },
}));

import {
  fetchStockQuote,
  fetchStockQuotes,
  getNikkei225List,
  toYahooTicker,
} from "@/lib/stock-fetcher";

describe("stock-fetcher", () => {
  beforeEach(() => {
    mockQuoteFn.mockReset();
  });

  describe("getNikkei225List", () => {
    it("日経225銘柄リストを返す", () => {
      const list = getNikkei225List();

      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(225);

      // 各銘柄にcodeとnameがある
      for (const stock of list) {
        expect(stock).toHaveProperty("code");
        expect(stock).toHaveProperty("name");
        expect(typeof stock.code).toBe("string");
        expect(typeof stock.name).toBe("string");
      }
    });

    it("トヨタ自動車が含まれる", () => {
      const list = getNikkei225List();
      const toyota = list.find((s) => s.code === "7203");

      expect(toyota).toBeDefined();
      expect(toyota?.name).toBe("トヨタ自動車");
    });
  });

  describe("toYahooTicker", () => {
    it("証券コードを.T形式に変換する", () => {
      expect(toYahooTicker("7203")).toBe("7203.T");
      expect(toYahooTicker("9984")).toBe("9984.T");
      expect(toYahooTicker("6758")).toBe("6758.T");
    });
  });

  describe("fetchStockQuote", () => {
    it("正常にデータを取得できる", async () => {
      const mockResponse = {
        shortName: "TOYOTA MOTOR CORP",
        longName: "Toyota Motor Corporation",
        regularMarketPrice: 2500,
        trailingAnnualDividendYield: 0.025, // 2.5%
        trailingAnnualDividendRate: 62.5,
        marketCap: 40000000000000,
        trailingPE: 10.5,
        priceToBook: 1.2,
      };

      mockQuoteFn.mockResolvedValue(mockResponse);

      const result = await fetchStockQuote("7203");

      expect(result).not.toBeNull();
      expect(result?.code).toBe("7203");
      expect(result?.name).toBe("トヨタ自動車");
      expect(result?.price).toBe(2500);
      expect(result?.dividendYield).toBe(2.5); // 0.025 * 100
      expect(result?.dividend).toBe(62.5);
      expect(result?.marketCap).toBe(40000000000000);
      expect(result?.per).toBe(10.5);
      expect(result?.pbr).toBe(1.2);

      expect(mockQuoteFn).toHaveBeenCalledWith("7203.T");
    });

    it("APIエラー時はnullを返す", async () => {
      mockQuoteFn.mockRejectedValue(new Error("API Error"));

      const result = await fetchStockQuote("7203");

      expect(result).toBeNull();
    });

    it("部分的なデータでも処理できる", async () => {
      const mockResponse = {
        shortName: "TEST CORP",
        regularMarketPrice: 1000,
        // 配当情報なし
      };

      mockQuoteFn.mockResolvedValue(mockResponse);

      const result = await fetchStockQuote("9999");

      expect(result).not.toBeNull();
      expect(result?.price).toBe(1000);
      expect(result?.dividendYield).toBeNull();
      expect(result?.dividend).toBeNull();
    });
  });

  describe("fetchStockQuotes", () => {
    it("複数銘柄を取得できる", async () => {
      const mockResponse = {
        shortName: "TEST",
        regularMarketPrice: 1000,
      };

      mockQuoteFn.mockResolvedValue(mockResponse);

      const results = await fetchStockQuotes(["7203", "9984", "6758"]);

      expect(results).toHaveLength(3);
      expect(mockQuoteFn).toHaveBeenCalledTimes(3);
    });

    it("失敗した銘柄はスキップされる", async () => {
      mockQuoteFn
        .mockResolvedValueOnce({ shortName: "A", regularMarketPrice: 100 })
        .mockRejectedValueOnce(new Error("Error"))
        .mockResolvedValueOnce({ shortName: "C", regularMarketPrice: 300 });

      const results = await fetchStockQuotes(["A", "B", "C"]);

      expect(results).toHaveLength(2);
    });
  });
});
