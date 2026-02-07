export interface QuoteOut {
  quote_id: number;
  date: string;
  speaker: string;
  quote_text: string;
  context?: string;
  source?: string;
}

export interface ArticleBrief {
  article_id: number;
  slug: string;
  title: string;
  lead: string;
  published_date: string;
  author?: string;
  category?: string;
  tags?: string[];
}

export interface ArticleDetail extends ArticleBrief {
  body: string;
  source?: string;
  source_url?: string;
  related_drivers?: string[];
  related_constructors?: string[];
}

// Aliases for components that expect different names
export type Article = ArticleBrief;
export type Quote = QuoteOut;
