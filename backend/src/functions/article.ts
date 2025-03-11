import { app, HttpRequest, HttpResponseInit, InvocationContext, output, input } from "@azure/functions";
import { CosmosClient } from '@azure/cosmos';
import { Article, ArticleCategory, articleCategories } from "../data";

const DB_NAME = process.env["CosmosDB_DatabaseName"];
const CONTAINER_NAME = process.env["CosmosDB_Articles_ContainerName"];

const cosmosClient = new CosmosClient(process.env["CosmosDbConnectionSetting"]);
export const articleContainerInterface = cosmosClient.database(DB_NAME).container(CONTAINER_NAME);

export const articleOutput = output.cosmosDB({
    databaseName: DB_NAME,
    containerName: CONTAINER_NAME,
    createIfNotExists: true,
    connection: 'CosmosDbConnectionSetting'
});

export const queryArticlePreview = input.cosmosDB({
    databaseName: DB_NAME,
    containerName: CONTAINER_NAME,
    connection: 'CosmosDbConnectionSetting',
    sqlQuery: 'SELECT c.id, c.title, c.category, c.url, c.site, c.timestamp, c.key FROM c'
});

export const queryArticleLinks = input.cosmosDB({
    databaseName: DB_NAME,
    containerName: CONTAINER_NAME,
    connection: 'CosmosDbConnectionSetting',
    sqlQuery: 'SELECT c.id, c.url, c.title FROM c'
});

export const queryArticleForDeletion = input.cosmosDB({
    databaseName: DB_NAME,
    containerName: CONTAINER_NAME,
    connection: 'CosmosDbConnectionSetting',
    sqlQuery: 'SELECT c.id, c.timestamp, c.key FROM c'
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
    authLevel: 'anonymous',
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
    authLevel: 'anonymous',
    handler: httpGetArticleById
});

const shuffle = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

export async function httpGetArticlesPreviewByCategory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const category = request.query.get('category');
    if (!category) {
        return {
            status: 400,
            body: 'Category is required'
        };
    }
    if (!articleCategories.includes(category as ArticleCategory)) {
        return {
            status: 400,
            body: 'Invalid category'
        };
    }

    context.log(`Http function processed request for article category "${category}"`);

    const querySpec = {
        query: "SELECT c.id, c.title, c.category, c.url, c.site, c.timestamp, c.key FROM c WHERE c.category = @category",
        parameters: [{
            name: "@category",
            value: category as string,
        }],
    };

    const { resources } = await articleContainerInterface.items.query(querySpec).fetchAll();
    if (resources) {
        return { 
            body: JSON.stringify(shuffle(resources.filter(a => a.title !== "").map(article => ({
                ...article,
                content: ''
            } as Article))))
        };
    }

    return {
        status: 404,
        body: 'Articles not found'
    };
}

app.http('getArticlesPreviewByCategory', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: httpGetArticlesPreviewByCategory
});
