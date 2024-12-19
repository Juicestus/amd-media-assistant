import { app, HttpRequest, HttpResponseInit, InvocationContext, Timer, output } from "@azure/functions";
import * as scr from "../internal/scrape";
import { getArticleDirectories } from "./articleDirectory";

async function identifyArticleLinks(urls: string[]) {
    await scr.initScraperIfNull();

    for (const url of urls) {
        console.log(url);
        console.log('=====================');
        const content = await scr.grabArticleLinksFromPage(url);
        console.log(content);
    }
}

export async function timerTrigger(tim: Timer, context: InvocationContext): Promise<void> {
    const links = ((await context.extraInputs.get(getArticleDirectories)) as any[])
            .map((dir: any) => dir.url);
    await identifyArticleLinks(links);
}

app.timer('timerTrigger', {
    // schedule: '*/30 * * * * *',  // every 30 seconds
    schedule: '* */1 * * * *',     // every 30 minutes
    runOnStartup: false,
    // runOnStartup: true,
    handler: timerTrigger,
    extraInputs: [getArticleDirectories]
});
