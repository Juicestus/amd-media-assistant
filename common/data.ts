
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

export function isArticle(obj: any): obj is Article {
    return typeof obj === 'object' && obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.url === 'string' &&
        typeof obj.site === 'string' &&
        typeof obj.category === 'string'
        && articleCategories.includes(obj.category)
        && typeof obj.content === 'string'
        && typeof obj.timestamp === 'number';
}

export interface ArticleDirectory {
    id: string;
    url: string;
}

export function isArticleDirectory(obj: any): obj is ArticleDirectory {
    return typeof obj === 'object' && obj !== null && 
           typeof obj.id === 'string' && 
           typeof obj.url === 'string';
}
