import { app, HttpRequest, HttpResponseInit, InvocationContext, output, input } from "@azure/functions";
import { ArticleDirectory, isArticleDirectory } from "../data";

export const articleDirectoriesOutput = output.cosmosDB({
    databaseName: 'amd-assistant-database',
    containerName: 'article-directories',
    createIfNotExists: true,
    connection: 'CosmosDbConnectionSetting'
});

export const articleDirectoriesInput = input.cosmosDB({
    databaseName: 'amd-assistant-database',
    containerName: 'article-directories',
    connection: 'CosmosDbConnectionSetting',
    sqlQuery: 'SELECT * FROM c'
});

export async function httpPostArticleDirectory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const data: any  = await request.json();

        if (!isArticleDirectory(data)) {
            return {
                status: 400,
                body: 'Please provide both id and url in the request body.'
            };
        }

        context.extraOutputs.set(articleDirectoriesOutput, {
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
    extraOutputs: [articleDirectoriesOutput],
    authLevel: 'function',
    handler: httpPostArticleDirectory
});

export async function httpGetArticleDirectories(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const articleDirectories = context.extraInputs.get(articleDirectoriesInput);

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
    extraInputs: [articleDirectoriesInput],
    authLevel: 'function',
    handler: httpGetArticleDirectories
});

export async function httpDeleteArticleDirectory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.query.get('id');

    if (!id) {
        return {
            status: 400,
            body: 'Please provide the id of the article directory to delete.'
        };
    }

    try {
        const deleteQuery = {
            query: 'DELETE FROM c WHERE c.id = @id',
            parameters: [{ name: '@id', value: id }]
        };

        context.extraOutputs.set(articleDirectoriesOutput, deleteQuery);

        return {
            status: 200,
            body: `Deleted Article Directory with id ${id}`
        };
    } catch (error) {
        return {
            status: 500,
            body: 'Failed to delete the article directory.'
        };
    }
};

app.http('deleteArticleDirectory', {
    methods: ['DELETE'],
    extraOutputs: [articleDirectoriesOutput],
    authLevel: 'function',
    handler: httpDeleteArticleDirectory
});