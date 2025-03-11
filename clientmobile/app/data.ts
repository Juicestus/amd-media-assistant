// Make sure this file is consistent accross the subprojects until
// a solution to shared library linking is found.

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
    key: string;
}

export function isArticle(obj: any): obj is Article {
    return typeof obj === 'object' && obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.url === 'string' &&
        typeof obj.site === 'string' &&
        typeof obj.category === 'string'
        && articleCategories.includes(obj.category)
        && typeof obj.content === 'string'
        && typeof obj.timestamp === 'number'
        && typeof obj.key === 'string';
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

export const onewayKeyify = (k: string) => k.replace(/ /g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");

export const blobUrl = (a: Article, type: 'content' | 'title') => 
{
    console.log(a);
    return "https://helpamdstorage.blob.core.windows.net/tts/" + a.id + "-" + type + ".wav";
}