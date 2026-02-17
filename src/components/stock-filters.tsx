"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortField, SortOrder, StockFilters } from "@/types/stock";

interface StockFiltersProps {
  filters: StockFilters;
  onFiltersChange: (filters: StockFilters) => void;
}

/** ソートオプションの定義 */
const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "dividendYield", label: "配当利回り" },
  { value: "price", label: "株価" },
  { value: "marketCap", label: "時価総額" },
  { value: "per", label: "PER" },
  { value: "pbr", label: "PBR" },
  { value: "name", label: "銘柄名" },
  { value: "code", label: "証券コード" },
];

/**
 * 銘柄フィルタパネル
 * ソート条件と日経225フィルタを提供
 */
export function StockFiltersPanel({ filters, onFiltersChange }: StockFiltersProps) {
  const handleSortChange = (value: SortField) => {
    onFiltersChange({ ...filters, sort: value });
  };

  const handleOrderChange = (value: SortOrder) => {
    onFiltersChange({ ...filters, order: value });
  };

  const handleNikkei225Change = (value: string) => {
    onFiltersChange({ ...filters, nikkei225Only: value === "true" });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* ソート設定 */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              並び替え
            </span>
            <div className="flex gap-2">
              <Select value={filters.sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="項目を選択" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.order} onValueChange={handleOrderChange}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="順序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">降順</SelectItem>
                  <SelectItem value="asc">昇順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 日経225フィルタ */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              対象
            </span>
            <Select
              value={filters.nikkei225Only ? "true" : "false"}
              onValueChange={handleNikkei225Change}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="対象を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">全銘柄</SelectItem>
                <SelectItem value="true">日経225のみ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
