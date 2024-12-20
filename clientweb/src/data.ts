
export interface ArticleDirectory {
    id: string;
    url: string;
}

export type ArticleCategory = 'news' | 'politics' | 'economy' | 'sports';
export const articleCategories: ArticleCategory[] = ['news', 'politics', 'economy', 'sports'];

export interface Article {
    id: string;
    url: string;
    site: string;
    title: string;
    category: ArticleCategory;
    content: string;
    timestamp: number;
}