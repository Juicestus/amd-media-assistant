import { app, HttpRequest, HttpResponseInit, InvocationContext, Timer, output, input } from "@azure/functions";
import * as scr from "../internal/scrape";
import { articleDirectoriesInput } from "./articleDirectory";
import { articleOutput } from "./article";

const MAX_ARTICLE_LINKS_PER_DIRECTORY = 5;  // simple cap for excessive data
                                            // low for testing

async function identifyArticleLinks(urls: string[]) {
    const articleLinks: Set<string> = new Set<string>();
    for (const url of urls) {
        console.log('Scraping links from article directory ' + url);
        const links = await scr.grabArticleLinksFromPage(url);
        console.log('Scraped ' + links.length + ' links:');
        for (let i = 0; i < links.length && i < 10; i++) {
            console.log(links[i]);
        }
        if (links.length > 10) {
            console.log('and more...');
        }
        for (let i = 0; i < links.length && i < MAX_ARTICLE_LINKS_PER_DIRECTORY; i++) {
            articleLinks.add(links[i]);
        }
    }
    console.log("Links grabbed: ");
    const articleLinksList = [];
    for (const link of articleLinks) {
        console.log(link);
        articleLinksList.push(link);
    }
    return articleLinksList;
}


export async function timerTrigger(tim: Timer, context: InvocationContext): Promise<void> {
    await scr.initScraperIfNull();
    const articleDirectoryLinks = ((await context.extraInputs.get(articleDirectoriesInput)) as any[])
            .map((dir: any) => dir.url);
    // console.log(articleDirectoryLinks);
    const articleLinks = await identifyArticleLinks(articleDirectoryLinks);
    for (const articleLink of articleLinks) {
        console.log('Scraping content from article ' + articleLink);
        const article = await scr.scrapeArticleFromLink(articleLink);
        console.log('Article properties identified:');
        console.log('| Site: ' + article.site);
        console.log('| Title: ' + article.title);
        console.log('| Category: ' + article.category);
        console.log('| Content: ' + article.content.substring(0, Math.min(100, article.content.length)) + '...');
        console.log('| Timestamp: ' + article.timestamp);
        context.extraOutputs.set(articleOutput, article);
    }
}

app.timer('timerTrigger', {
    // schedule: '*/30 * * * * *',  // every 30 seconds
    schedule: '0 */2 * * *',     // every 2 hours
    // runOnStartup: false,
    runOnStartup: true,
    handler: timerTrigger,
    extraInputs: [articleDirectoriesInput],
    extraOutputs: [articleOutput]
});
