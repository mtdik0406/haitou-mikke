import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">配当みっけ</span>
        </Link>
        <nav className="ml-auto flex items-center space-x-4">
          <Link
            href="/ranking"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ランキング
          </Link>
        </nav>
      </div>
    </header>
  );
}
