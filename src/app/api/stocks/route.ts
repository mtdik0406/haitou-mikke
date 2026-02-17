import { ApiError, handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";

// クエリパラメータのバリデーションスキーマ
const querySchema = z.object({
  // ソート
  sort: z
    .enum(["dividendYield", "price", "marketCap", "per", "pbr", "name", "code"])
    .default("dividendYield"),
  order: z.enum(["asc", "desc"]).default("desc"),

  // フィルタ
  sector: z.string().optional(),
  nikkei225Only: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  minYield: z.coerce.number().min(0).optional(),
  maxYield: z.coerce.number().min(0).optional(),

  // ページネーション
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type StocksQueryParams = z.infer<typeof querySchema>;

// レスポンス型
export interface StockItem {
  code: string;
  name: string;
  sector: string | null;
  price: number | null;
  dividendYield: number | null;
  dividend: number | null;
  marketCap: number | null;
  per: number | null;
  pbr: number | null;
  isNikkei225: boolean;
  updatedAt: string;
}

export interface StocksResponse {
  data: StockItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * GET /api/stocks
 * 銘柄一覧を取得（ソート・フィルタ・ページネーション対応）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams = Object.fromEntries(searchParams.entries());

    // バリデーション
    const parseResult = querySchema.safeParse(rawParams);
    if (!parseResult.success) {
      throw ApiError.badRequest(
        `Invalid parameters: ${parseResult.error.issues.map((i) => i.message).join(", ")}`
      );
    }

    const params = parseResult.data;

    // WHERE条件を構築
    const where: {
      sector?: string;
      isNikkei225?: boolean;
      dividendYield?: { gte?: number; lte?: number };
    } = {};

    if (params.sector) {
      where.sector = params.sector;
    }

    if (params.nikkei225Only) {
      where.isNikkei225 = true;
    }

    if (params.minYield !== undefined || params.maxYield !== undefined) {
      where.dividendYield = {};
      if (params.minYield !== undefined) {
        where.dividendYield.gte = params.minYield;
      }
      if (params.maxYield !== undefined) {
        where.dividendYield.lte = params.maxYield;
      }
    }

    // 総件数を取得
    const total = await prisma.stock.count({ where });

    // データを取得
    const stocks = await prisma.stock.findMany({
      where,
      orderBy: {
        [params.sort]: params.order,
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    // レスポンスを整形
    const data: StockItem[] = stocks.map((stock) => ({
      code: stock.code,
      name: stock.name,
      sector: stock.sector,
      price: stock.price ? Number(stock.price) : null,
      dividendYield: stock.dividendYield ? Number(stock.dividendYield) : null,
      dividend: stock.dividend ? Number(stock.dividend) : null,
      marketCap: stock.marketCap ? Number(stock.marketCap) : null,
      per: stock.per ? Number(stock.per) : null,
      pbr: stock.pbr ? Number(stock.pbr) : null,
      isNikkei225: stock.isNikkei225,
      updatedAt: stock.updatedAt.toISOString(),
    }));

    const response: StocksResponse = {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };

    return Response.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
