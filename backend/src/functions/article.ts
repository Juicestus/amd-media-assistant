import { app, HttpRequest, HttpResponseInit, InvocationContext, output, input } from "@azure/functions";
import { CosmosClient } from '@azure/cosmos';
import { Article, ArticleCategory, articleCategories } from "../data";

const cosmosClient = new CosmosClient(process.env["CosmosDbConnectionSetting"]);
const articleContainerInterface = cosmosClient.database('amd-assistant-database').container('articles');

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
    sqlQuery: 'SELECT c.id, c.title, c.category, c.url, c.site, c.timestamp FROM c'
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

    let decoded: string;
    try {
        decoded = decodeURIComponent(articleId);
    }  catch (error) {
        return {
            status: 400,
            body: 'Invalid article ID'
        };
    }

    const querySpec = {
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{
            name: "@id",
            value: decoded,
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

export async function httpGetArticlesPreviewByCategory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const category = request.query.get('category');
    if (!category) {
        return {
            status: 400,
            body: 'Category is required'
        };
    }
    console.log("ACATS:" + articleCategories);
    if (!articleCategories.includes(category as ArticleCategory)) {
        return {
            status: 400,
            body: 'Invalid category'
        };
    }

    context.log(`Http function processed request for article category "${category}"`);

    const querySpec = {
        query: "SELECT c.id, c.title, c.category, c.url, c.site, c.timestamp FROM c WHERE c.category = @category",
        parameters: [{
            name: "@category",
            value: category as string,
        }],
    };

    const { resources } = await articleContainerInterface.items.query(querySpec).fetchAll();
    if (resources) {
        return { 
            body: JSON.stringify(resources.map(article => ({
                ...article,
                content: ''
            } as Article)))
        };
    }

    return {
        status: 404,
        body: 'Articles not found'
    };
}

app.http('getArticlesPreviewByCategory', {
    methods: ['GET'],
    authLevel: 'function',
    handler: httpGetArticlesPreviewByCategory
});
