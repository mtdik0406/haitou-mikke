import { ApiError, handleApiError } from "@/lib/api-error";
import { syncAllStocks } from "@/lib/stock-sync";
import type { NextRequest } from "next/server";

/**
 * POST /api/sync
 * 全銘柄のデータを同期
 */
export async function POST(request: NextRequest) {
  try {
    // CRON_SECRET による認証（Vercel Cronジョブ用）
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // 本番環境ではCRON_SECRET必須
    if (process.env.NODE_ENV === "production" && !cronSecret) {
      throw ApiError.internal("CRON_SECRET is not configured");
    }

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      throw ApiError.unauthorized("Invalid authorization");
    }

    const result = await syncAllStocks();

    return Response.json({
      success: result.success,
      data: {
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        errors: result.errors.slice(0, 10), // 最初の10件のエラーのみ返す
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/sync
 * 同期ステータスを確認（開発用）
 */
export async function GET() {
  return Response.json({
    message: "Use POST to sync stock data",
    endpoint: "/api/sync",
    method: "POST",
  });
}
