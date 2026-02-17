import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ code: string }>;
}

/**
 * 動的メタデータ生成
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const stock = await prisma.stock.findUnique({
    where: { code },
    select: { name: true, code: true },
  });

  if (!stock) {
    return { title: "銘柄が見つかりません" };
  }

  return {
    title: `${stock.name}（${stock.code}）の配当情報 | 配当みっけ`,
    description: `${stock.name}（${stock.code}）の配当利回り、株価、配当金、PER、PBRなどの詳細情報`,
  };
}

/**
 * 数値を日本語表記でフォーマット（億、兆）
 */
function formatMarketCap(value: number | null): string {
  if (value === null) return "-";
  if (value >= 1000) {
    return `${(value / 10000).toFixed(2)}兆円`;
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
 * 銘柄詳細ページ
 */
export default async function StockDetailPage({ params }: PageProps) {
  const { code } = await params;

  // 証券コードのバリデーション
  if (!/^\d{4}$/.test(code)) {
    notFound();
  }

  const stock = await prisma.stock.findUnique({
    where: { code },
  });

  if (!stock) {
    notFound();
  }

  const price = stock.price != null ? Number(stock.price) : null;
  const dividendYield = stock.dividendYield != null ? Number(stock.dividendYield) : null;
  const dividend = stock.dividend != null ? Number(stock.dividend) : null;
  const marketCap = stock.marketCap != null ? Number(stock.marketCap) : null;
  const per = stock.per != null ? Number(stock.per) : null;
  const pbr = stock.pbr != null ? Number(stock.pbr) : null;

  return (
    <div className="container py-6 md:py-8">
      <div className="space-y-6">
        {/* 戻るボタン */}
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">&larr; ランキングに戻る</Link>
          </Button>
        </div>

        {/* ヘッダー */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg text-muted-foreground">{stock.code}</span>
            {stock.isNikkei225 && <Badge variant="secondary">日経225</Badge>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{stock.name}</h1>
          {stock.sector && <p className="text-muted-foreground">{stock.sector}</p>}
        </div>

        {/* メインカード - 配当情報 */}
        <Card>
          <CardHeader>
            <CardTitle>配当情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">配当利回り</p>
                <p className="text-3xl font-bold text-primary">{formatYield(dividendYield)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">年間配当金</p>
                <p className="text-2xl font-semibold">{formatPrice(dividend)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">株価</p>
                <p className="text-2xl font-semibold">{formatPrice(price)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 指標カード */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">バリュエーション指標</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">PER（株価収益率）</p>
                  <p className="text-xl font-semibold">{formatRatio(per)}倍</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">PBR（株価純資産倍率）</p>
                  <p className="text-xl font-semibold">{formatRatio(pbr)}倍</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">企業規模</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">時価総額</p>
                <p className="text-xl font-semibold">{formatMarketCap(marketCap)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 更新日時 */}
        <p className="text-sm text-muted-foreground">
          最終更新: {new Date(stock.updatedAt).toLocaleString("ja-JP")}
        </p>
      </div>
    </div>
  );
}
