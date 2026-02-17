/**
 * 銘柄情報の型定義
 */
export interface Stock {
  /** 証券コード（例: 7203） */
  code: string;
  /** 銘柄名 */
  name: string;
  /** セクター/業種 */
  sector: string | null;
  /** 現在株価 */
  price: number | null;
  /** 配当利回り（%） */
  dividendYield: number | null;
  /** 年間配当金額 */
  dividend: number | null;
  /** 時価総額（百万円） */
  marketCap: number | null;
  /** PER（株価収益率） */
  per: number | null;
  /** PBR（株価純資産倍率） */
  pbr: number | null;
  /** 日経225採用銘柄かどうか */
  isNikkei225: boolean;
  /** 更新日時 */
  updatedAt: string;
}

/**
 * APIレスポンスのページネーション情報
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * /api/stocks のレスポンス型
 */
export interface StocksResponse {
  data: Stock[];
  pagination: Pagination;
}

/**
 * ソートフィールドの型
 */
export type SortField = "dividendYield" | "price" | "marketCap" | "per" | "pbr" | "name" | "code";

/**
 * ソート順序の型
 */
export type SortOrder = "asc" | "desc";

/**
 * フィルタ条件の型
 */
export interface StockFilters {
  sort: SortField;
  order: SortOrder;
  nikkei225Only: boolean;
}
