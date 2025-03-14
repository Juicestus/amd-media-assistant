import { app, HttpRequest, HttpResponseInit, InvocationContext, output, input } from "@azure/functions";
import { ArticleDirectory, isArticleDirectory } from "../data";
import { CosmosClient } from "@azure/cosmos";

const DB_NAME = process.env["CosmosDB_DatabaseName"];
const CONTAINER_NAME = process.env["CosmosDB_ArticleDirectories_ContainerName"];

const cosmosClient = new CosmosClient(process.env["CosmosDbConnectionSetting"]);
export const articleDirectoryContainerInterface = cosmosClient.database(DB_NAME).container(CONTAINER_NAME);

export const articleDirectoriesOutput = output.cosmosDB({
    databaseName: DB_NAME,
    containerName: CONTAINER_NAME,
    createIfNotExists: true,
    connection: 'CosmosDbConnectionSetting'
});

export const articleDirectoriesInput = input.cosmosDB({
    databaseName: DB_NAME,
    containerName: CONTAINER_NAME,
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
    authLevel: 'anonymous',
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
    authLevel: 'anonymous',
    handler: httpGetArticleDirectories
});

export async function httpDeleteArticleDirectory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.query.get('id');
    console.log("Deleteing article directory with ID " + id);

    if (!id) {
        return {
            status: 400,
            body: 'Please provide the id of the article directory to delete.'
        };
    }

    try {
        articleDirectoryContainerInterface.item(id, id).delete();
        return {
            status: 200,
            body: `Deleted article directory with id ${id}`
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
    authLevel: 'anonymous',
    handler: httpDeleteArticleDirectory
});