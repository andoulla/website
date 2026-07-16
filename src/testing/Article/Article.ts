import type { Article as ArticleType } from '@/types';

import { defaultArticle } from './Article.data';

export class Article {
  private data: ArticleType;

  constructor() {
    this.data = { ...defaultArticle };
  }

  id(id: string): this {
    this.data = { ...this.data, id };
    return this;
  }

  title(title: string): this {
    this.data = { ...this.data, title };
    return this;
  }

  link(link: string): this {
    this.data = { ...this.data, link };
    return this;
  }

  publishedDate(publishedDate: string): this {
    this.data = { ...this.data, publishedDate };
    return this;
  }

  tags(tags: string[]): this {
    this.data = { ...this.data, tags };
    return this;
  }

  excerpt(excerpt: string): this {
    this.data = { ...this.data, excerpt };
    return this;
  }

  imageUrl(imageUrl: string): this {
    this.data = { ...this.data, imageUrl };
    return this;
  }

  mock(): ArticleType {
    return { ...this.data };
  }
}
