import { syncAllStocks } from "@/lib/stock-sync";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 依存関係をモック
vi.mock("@/lib/prisma", () => ({
  prisma: {
    stock: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/stock-fetcher", () => ({
  fetchAllNikkei225Quotes: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { fetchAllNikkei225Quotes } from "@/lib/stock-fetcher";

describe("stock-sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("syncAllStocks", () => {
    it("全銘柄を正常に同期できる", async () => {
      const mockQuotes = [
        {
          code: "7203",
          name: "トヨタ自動車",
          price: 2500,
          dividendYield: 2.5,
          dividend: 62.5,
          marketCap: 40000000000000,
          per: 10.5,
          pbr: 1.2,
          sector: null,
        },
        {
          code: "9984",
          name: "ソフトバンクグループ",
          price: 8000,
          dividendYield: 0.5,
          dividend: 44,
          marketCap: 12000000000000,
          per: 15,
          pbr: 1.5,
          sector: null,
        },
      ];

      vi.mocked(fetchAllNikkei225Quotes).mockResolvedValue(mockQuotes);
      vi.mocked(prisma.stock.upsert).mockResolvedValue({} as never);

      const result = await syncAllStocks();

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(result.errors).toHaveLength(0);

      expect(prisma.stock.upsert).toHaveBeenCalledTimes(2);
    });

    it("DB保存エラー時もエラーを記録して継続する", async () => {
      const mockQuotes = [
        {
          code: "7203",
          name: "トヨタ自動車",
          price: 2500,
          dividendYield: 2.5,
          dividend: 62.5,
          marketCap: 40000000000000,
          per: 10.5,
          pbr: 1.2,
          sector: null,
        },
        {
          code: "9984",
          name: "ソフトバンクグループ",
          price: 8000,
          dividendYield: 0.5,
          dividend: 44,
          marketCap: 12000000000000,
          per: 15,
          pbr: 1.5,
          sector: null,
        },
      ];

      vi.mocked(fetchAllNikkei225Quotes).mockResolvedValue(mockQuotes);
      vi.mocked(prisma.stock.upsert)
        .mockResolvedValueOnce({} as never)
        .mockRejectedValueOnce(new Error("DB Error"));

      const result = await syncAllStocks();

      expect(result.success).toBe(false);
      expect(result.syncedCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("9984");
    });

    it("データ取得エラー時はエラーを返す", async () => {
      vi.mocked(fetchAllNikkei225Quotes).mockRejectedValue(new Error("Fetch failed"));

      const result = await syncAllStocks();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Fetch failed");
    });

    it("空のデータでも正常に処理できる", async () => {
      vi.mocked(fetchAllNikkei225Quotes).mockResolvedValue([]);

      const result = await syncAllStocks();

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(0);
      expect(result.failedCount).toBe(0);
    });
  });
});
