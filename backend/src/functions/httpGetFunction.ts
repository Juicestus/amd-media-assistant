import { app, HttpRequest, HttpResponseInit, InvocationContext, Timer } from "@azure/functions";
import * as scr from "../internal/scrape";


export async function timerTrigger(tim: Timer, context: InvocationContext): Promise<void> {
    await scr.initScraperIfNull();
    const url = 'https://www.cnn.com/world';
    // const url = 'https://www.foxnews.com/world';
    const content = await scr.grabArticleLinksFromPage(url);
    context.log(content);
}

export async function httpGetFunction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
};

app.timer('timerTrigger', {
    // schedule: '*/30 * * * * *',  // every 30 seconds
    schedule: '* */30 * * * *',     // every 30 minutes
    runOnStartup: true,
    handler: timerTrigger
});

app.http('httpget', {
    methods: ['GET'],
    authLevel: 'function',
    handler: httpGetFunction
});

