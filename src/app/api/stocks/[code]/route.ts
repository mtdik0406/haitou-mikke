import { ApiError, handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import type { Stock } from "@/types/stock";

interface RouteParams {
  params: Promise<{ code: string }>;
}

/**
 * GET /api/stocks/[code]
 * 個別銘柄の詳細を取得
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { code } = await params;

    // 証券コードのバリデーション（4桁の数字）
    if (!/^\d{4}$/.test(code)) {
      throw ApiError.badRequest("Invalid stock code format. Must be 4 digits.");
    }

    const stock = await prisma.stock.findUnique({
      where: { code },
    });

    if (!stock) {
      throw ApiError.notFound(`Stock with code ${code} not found`);
    }

    // レスポンスを整形
    const data: Stock = {
      code: stock.code,
      name: stock.name,
      sector: stock.sector,
      price: stock.price != null ? Number(stock.price) : null,
      dividendYield: stock.dividendYield != null ? Number(stock.dividendYield) : null,
      dividend: stock.dividend != null ? Number(stock.dividend) : null,
      marketCap: stock.marketCap != null ? Number(stock.marketCap) : null,
      per: stock.per != null ? Number(stock.per) : null,
      pbr: stock.pbr != null ? Number(stock.pbr) : null,
      isNikkei225: stock.isNikkei225,
      updatedAt: stock.updatedAt.toISOString(),
    };

    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
