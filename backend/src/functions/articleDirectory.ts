import { app, HttpRequest, HttpResponseInit, InvocationContext, output, input } from "@azure/functions";

export interface ArticleDirectory {
    id: string;
    url: string;
}

export function isArticleDirectory(obj: any): obj is ArticleDirectory {
    return typeof obj === 'object' && obj !== null && 
           typeof obj.id === 'string' && 
           typeof obj.url === 'string';
}

export const sendToArticleDirectories = output.cosmosDB({
    databaseName: 'amd-assistant-database',
    containerName: 'article-directories',
    createIfNotExists: true,
    connection: 'CosmosDbConnectionSetting'
});

export const getArticleDirectories = input.cosmosDB({
    databaseName: 'amd-assistant-database',
    containerName: 'article-directories',
    connection: 'CosmosDbConnectionSetting',
    sqlQuery: 'SELECT * FROM c'
});

export async function httpPostAddArticleDirectory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const data: any  = await request.json();

        if (!isArticleDirectory(data)) {
            return {
                status: 400,
                body: 'Please provide both id and url in the request body.'
            };
        }

        context.extraOutputs.set(sendToArticleDirectories, {
            id: data.id,
            url: data.url
          });

        return {
            status: 200,
            body: `Added Article Directory ${data.id} with URL ${data.url}`
        };
    } catch (error) {
        return {
            status: 400,
            body: 'Invalid request body. Please provide a valid JSON object with id and url.'
        };
    }
};

app.http('addArticleDirectory', {
    methods: ['POST'],
    extraOutputs: [sendToArticleDirectories],
    authLevel: 'function',
    handler: httpPostAddArticleDirectory
});

export async function httpGetGetArticleDirectories(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const articleDirectories = context.extraInputs.get(getArticleDirectories);

    if (articleDirectories) {
        return { body: JSON.stringify(articleDirectories) };
    }

    return {
            status: 500,
            body: 'Couldn\'t fetch article directories from database.'
        };
};

app.http('getArticleDirectories', {
    methods: ['GET'],
    extraInputs: [getArticleDirectories],
    authLevel: 'function',
    handler: httpGetGetArticleDirectories
});