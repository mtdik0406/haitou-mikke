import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center py-24">
      <div className="flex flex-col items-center gap-8 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">配当みっけ</h1>
        <p className="text-lg text-muted-foreground">
          日本株の配当利回りランキングを提供する配当株情報サービス
        </p>
        <Button asChild size="lg">
          <Link href="/ranking">ランキングを見る</Link>
        </Button>
      </div>
    </div>
  );
}
