import { beforeEach, describe, expect, it, vi } from "vitest";

// Prismaモック
vi.mock("@/lib/prisma", () => ({
  prisma: {
    stock: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/stocks/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function createRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost:3000/api/stocks");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

describe("/api/stocks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStocks = [
    {
      id: 1,
      code: "7203",
      name: "トヨタ自動車",
      sector: "輸送用機器",
      price: 2500,
      dividendYield: 2.5,
      dividend: 62.5,
      marketCap: 40000000000000n,
      per: 10.5,
      pbr: 1.2,
      isNikkei225: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: 2,
      code: "9984",
      name: "ソフトバンクグループ",
      sector: "情報・通信",
      price: 8000,
      dividendYield: 0.5,
      dividend: 44,
      marketCap: 12000000000000n,
      per: 15,
      pbr: 1.5,
      isNikkei225: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15"),
    },
  ];

  describe("GET", () => {
    it("銘柄一覧を取得できる", async () => {
      vi.mocked(prisma.stock.count).mockResolvedValue(2);
      vi.mocked(prisma.stock.findMany).mockResolvedValue(mockStocks);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
    });

    it("ソートパラメータが機能する", async () => {
      vi.mocked(prisma.stock.count).mockResolvedValue(2);
      vi.mocked(prisma.stock.findMany).mockResolvedValue(mockStocks);

      const request = createRequest({ sort: "price", order: "asc" });
      await GET(request);

      expect(prisma.stock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: "asc" },
        })
      );
    });

    it("フィルタパラメータが機能する", async () => {
      vi.mocked(prisma.stock.count).mockResolvedValue(1);
      vi.mocked(prisma.stock.findMany).mockResolvedValue([mockStocks[0]]);

      const request = createRequest({ sector: "輸送用機器" });
      await GET(request);

      expect(prisma.stock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sector: "輸送用機器",
          }),
        })
      );
    });

    it("日経225フィルタが機能する", async () => {
      vi.mocked(prisma.stock.count).mockResolvedValue(2);
      vi.mocked(prisma.stock.findMany).mockResolvedValue(mockStocks);

      const request = createRequest({ nikkei225Only: "true" });
      await GET(request);

      expect(prisma.stock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isNikkei225: true,
          }),
        })
      );
    });

    it("配当利回りフィルタが機能する", async () => {
      vi.mocked(prisma.stock.count).mockResolvedValue(1);
      vi.mocked(prisma.stock.findMany).mockResolvedValue([mockStocks[0]]);

      const request = createRequest({ minYield: "2", maxYield: "5" });
      await GET(request);

      expect(prisma.stock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dividendYield: { gte: 2, lte: 5 },
          }),
        })
      );
    });

    it("ページネーションが機能する", async () => {
      vi.mocked(prisma.stock.count).mockResolvedValue(100);
      vi.mocked(prisma.stock.findMany).mockResolvedValue([mockStocks[0]]);

      const request = createRequest({ page: "2", limit: "10" });
      const response = await GET(request);
      const data = await response.json();

      expect(prisma.stock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );

      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 100,
        totalPages: 10,
      });
    });

    it("無効なソートパラメータでエラーを返す", async () => {
      const request = createRequest({ sort: "invalid" });
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it("無効なページ番号でエラーを返す", async () => {
      const request = createRequest({ page: "0" });
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it("BigIntをNumberに変換できる", async () => {
      vi.mocked(prisma.stock.count).mockResolvedValue(1);
      vi.mocked(prisma.stock.findMany).mockResolvedValue([mockStocks[0]]);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(typeof data.data[0].marketCap).toBe("number");
      expect(data.data[0].marketCap).toBe(40000000000000);
    });
  });
});
