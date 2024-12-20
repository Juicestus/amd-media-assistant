import { app, HttpRequest, HttpResponseInit, InvocationContext, output, input } from "@azure/functions";

import { CosmosClient } from '@azure/cosmos';
const cosmosClient = new CosmosClient(process.env["CosmosDbConnectionSetting"]);
const articleContainerInterface = cosmosClient.database('amd-assistant-database').container('articles');

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

export const articleOutput = output.cosmosDB({
    databaseName: 'amd-assistant-database',
    containerName: 'articles',
    createIfNotExists: true,
    connection: 'CosmosDbConnectionSetting'
});

export const queryArticlePreview = input.cosmosDB({
    databaseName: 'amd-assistant-database',
    containerName: 'articles',
    connection: 'CosmosDbConnectionSetting',
    sqlQuery: 'SELECT c.id, c.category, c.url, c.site, c.timestamp FROM c'
});

export async function httpGetAllArticlesPreview(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const articles = context.extraInputs.get(queryArticlePreview) as Partial<Article>[];
    if (articles) {
        const articlesWithContent: Article[] = articles.map(article => ({
            ...article,
            content: ''
        } as Article));

        return { body: JSON.stringify(articlesWithContent) };
    }
    return {
        status: 500,
        body: 'Couldn\'t fetch articles from database.'
    };
};

app.http('getAllArticlesPreview', {
    methods: ['GET'],
    extraInputs: [queryArticlePreview],
    authLevel: 'function',
    handler: httpGetAllArticlesPreview
});

export async function httpGetArticleById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const articleId = request.query.get('id');
    if (!articleId) {
        return {
            status: 400,
            body: 'Article ID is required'
        };
    }

    context.log(`Http function processed request for article id "${articleId}"`);

    const querySpec = {
        query: "SELECT * FROM c WHERE c.url = @id",
        parameters: [{
            name: "@id",
            value: articleId,
        }],
    };

    const { resources } = await articleContainerInterface.items.query(querySpec).fetchAll();
    if (resources && resources.length > 0) {
        return { body: JSON.stringify(resources[0]) };
    }

    return {
        status: 404,
        body: 'Article not found'
    };
}

app.http('getArticleById', {
    methods: ['GET'],
    authLevel: 'function',
    handler: httpGetArticleById
});
