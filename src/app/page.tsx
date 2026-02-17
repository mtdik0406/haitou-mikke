import { StockRankingTable } from "@/components/stock-ranking-table";

export default function Home() {
  return (
    <div className="container py-6 md:py-8">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">配当みっけ</h1>
          <p className="text-muted-foreground">日本株の配当利回りランキング</p>
        </div>

        {/* ランキングテーブル */}
        <StockRankingTable />
      </div>
    </div>
  );
}
