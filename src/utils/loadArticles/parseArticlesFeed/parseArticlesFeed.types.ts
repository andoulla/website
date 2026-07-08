export interface RssFeedItem {
  guid?: string;
  link: string;
  title: string;
  pubDate: string;
  categories?: string[];
  description?: string;
}

export interface RssFeedResponse {
  status: string;
  items: RssFeedItem[];
}
