"use client";

import { StockFiltersPanel } from "@/components/stock-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Stock, StockFilters as StockFiltersType, StocksResponse } from "@/types/stock";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/**
 * 数値を日本語表記でフォーマット（億、万）
 */
function formatMarketCap(value: number | null): string {
  if (value === null) return "-";
  // value は百万円単位
  if (value >= 1000) {
    return `${(value / 10000).toFixed(1)}兆円`;
  }
  if (value >= 100) {
    return `${(value / 100).toFixed(0)}億円`;
  }
  return `${value.toFixed(0)}百万円`;
}

/**
 * 数値を通貨形式でフォーマット
 */
function formatPrice(value: number | null): string {
  if (value === null) return "-";
  return `${value.toLocaleString()}円`;
}

/**
 * 配当利回りをフォーマット
 */
function formatYield(value: number | null): string {
  if (value === null) return "-";
  return `${value.toFixed(2)}%`;
}

/**
 * PER/PBRをフォーマット
 */
function formatRatio(value: number | null): string {
  if (value === null) return "-";
  return value.toFixed(2);
}

/**
 * 銘柄ランキングテーブルコンポーネント
 * /api/stocks からデータを取得し、ランキング形式で表示
 */
export function StockRankingTable() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<StockFiltersType>({
    sort: "dividendYield",
    order: "desc",
    nikkei225Only: false,
  });

  const fetchStocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sort: filters.sort,
        order: filters.order,
        page: page.toString(),
        limit: "20",
      });

      if (filters.nikkei225Only) {
        params.set("nikkei225Only", "true");
      }

      const response = await fetch(`/api/stocks?${params.toString()}`);

      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const data: StocksResponse = await response.json();
      setStocks(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // フィルタ変更時はページを1に戻す
  const handleFiltersChange = (newFilters: StockFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

  // ランキング順位を計算
  const getRank = (index: number): number => {
    return (page - 1) * 20 + index + 1;
  };

  return (
    <div className="space-y-4">
      {/* フィルタパネル */}
      <StockFiltersPanel filters={filters} onFiltersChange={handleFiltersChange} />

      {/* テーブル */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">配当利回りランキング</CardTitle>
            <span className="text-sm text-muted-foreground">
              {total > 0 ? `全${total.toLocaleString()}件` : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">読み込み中...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="text-destructive">{error}</div>
              <Button variant="outline" onClick={fetchStocks}>
                再試行
              </Button>
            </div>
          ) : stocks.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">該当する銘柄がありません</div>
            </div>
          ) : (
            <>
              {/* デスクトップ用テーブル */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] text-center">順位</TableHead>
                      <TableHead className="w-[80px]">コード</TableHead>
                      <TableHead>銘柄名</TableHead>
                      <TableHead className="text-right">配当利回り</TableHead>
                      <TableHead className="text-right">株価</TableHead>
                      <TableHead className="text-right">配当金</TableHead>
                      <TableHead className="text-right">PER</TableHead>
                      <TableHead className="text-right">PBR</TableHead>
                      <TableHead className="text-right">時価総額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.map((stock, index) => (
                      <TableRow key={stock.code}>
                        <TableCell className="text-center font-medium">{getRank(index)}</TableCell>
                        <TableCell className="font-mono">
                          <Link
                            href={`/stocks/${stock.code}`}
                            className="hover:text-primary hover:underline"
                          >
                            {stock.code}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/stocks/${stock.code}`}
                              className="truncate max-w-[200px] hover:text-primary hover:underline"
                            >
                              {stock.name}
                            </Link>
                            {stock.isNikkei225 && (
                              <Badge variant="secondary" className="shrink-0">
                                N225
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatYield(stock.dividendYield)}
                        </TableCell>
                        <TableCell className="text-right">{formatPrice(stock.price)}</TableCell>
                        <TableCell className="text-right">{formatPrice(stock.dividend)}</TableCell>
                        <TableCell className="text-right">{formatRatio(stock.per)}</TableCell>
                        <TableCell className="text-right">{formatRatio(stock.pbr)}</TableCell>
                        <TableCell className="text-right">
                          {formatMarketCap(stock.marketCap)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* モバイル用カードリスト */}
              <div className="sm:hidden">
                <div className="divide-y">
                  {stocks.map((stock, index) => (
                    <Link
                      key={stock.code}
                      href={`/stocks/${stock.code}`}
                      className="block p-4 space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-muted-foreground w-8">
                            {getRank(index)}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-muted-foreground">
                                {stock.code}
                              </span>
                              {stock.isNikkei225 && (
                                <Badge variant="secondary" className="text-xs">
                                  N225
                                </Badge>
                              )}
                            </div>
                            <div className="font-medium">{stock.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {formatYield(stock.dividendYield)}
                          </div>
                          <div className="text-sm text-muted-foreground">配当利回り</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">株価</div>
                          <div>{formatPrice(stock.price)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">配当金</div>
                          <div>{formatPrice(stock.dividend)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">時価総額</div>
                          <div>{formatMarketCap(stock.marketCap)}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                前へ
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                次へ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
