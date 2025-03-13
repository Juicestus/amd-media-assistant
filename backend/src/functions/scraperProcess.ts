import { app, HttpRequest, HttpResponseInit, InvocationContext, Timer, output, input } from "@azure/functions";
import * as scr from "../internal/scrape";
import { articleDirectoriesInput } from "./articleDirectory";
import { articleContainerInterface, articleOutput, queryArticleLinks } from "./article";
import { generateTTS, removeFile, uploadTTS } from "../internal/tts";
import { Article, onewayKeyify } from "../data";

const MAX_ARTICLE_LINKS_PER_DIRECTORY = 12;  // simple cap for excessive data
                                            // low for testing

async function identifyArticleLinks(url: string): Promise<Partial<Article>[]> {
    const articleLinks: Set<string> = new Set<string>();
    if (url.indexOf("https://") !== 0) {
        console.log('Invalid URL: ' + url);
        return [];
    }
    console.log('Scraping links from article directory ' + url);
    let links;
    try {
        links = await scr.grabArticleLinksFromPage(url);
        if (links === null) return [];
    } catch {
        console.log('Error scraping links from article directory ' + url);
        return [];
    }
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

    console.log("Article IDs grabbed from article directory " + url + " are ");
    const articles: Partial<Article>[] = [];
    for (const link of articleLinks) {
        const id = onewayKeyify(link);
        console.log(id);
        articles.push({
                id: id,
                url: link,
                site: "", 
                title: "",              // title being empty is the garuntee for content not being scraped
                category: "news",
                content: "",
                timestamp: Date.now(),
                key: onewayKeyify['title']  // legacy*
            });
    }
    return articles;
}


export async function timerTrigger(tim: Timer, context: InvocationContext): Promise<void> {
    await scr.initScraperIfNull();

    let existingArticleSnips = (await context.extraInputs.get(queryArticleLinks)) as Partial<Article>[];
    let emtpyArticleSnips = existingArticleSnips.filter(a => a.title === "");

    if (existingArticleSnips.length <= 50) { // some constant -- if there are not enough articles lets get some more

        const articleDirectoryLinks = ((await context.extraInputs.get(articleDirectoriesInput)) as any[])
                .map((dir: any) => dir.url)
                // debug:
                .filter((url: string) => url !== "https://www.cnn.com/world" && url !== "https://www.thehindu.com/");

        

        console.log(articleDirectoryLinks);
        for (const articleDirectoryLink of articleDirectoryLinks) {
            const articles = await identifyArticleLinks(articleDirectoryLink);
            console.log("AAAA");
            for (const article of articles) {
                if (existingArticleSnips.map(a => a.id).includes(article.id)) { // inefficient downcast idgaf
                    console.log("Skipping article " + article.id + " as it already exists.");
                    continue;
                }
                try {
                    console.log("BBBB");
                    console.log(article);
                    articleContainerInterface.items.create(article).catch(() => {
                        console.log("Error creating article with ID " + article.id);
                    });       // <-- sometimes causes a bug
                    existingArticleSnips.push(article); // going to re-read ts later anyways
                    // context.extraOutputs.set(articleOutput, article);   // <-- also causes a bug (most of the time)
                                                                        // god fucking dammit
                } catch (e) {
                    console.log("Error: " + e);
                    continue;
                } 
            }
        }

    }
    // crossing this boundry causes read issue?

    // Replicate reads -- bad (also must make above let)
    existingArticleSnips = (await context.extraInputs.get(queryArticleLinks)) as Partial<Article>[];
    emtpyArticleSnips = existingArticleSnips.filter(a => a.title === "");

    for (const emptyArticleSnip of emtpyArticleSnips) {

        console.log('Scraping content from article ' + emptyArticleSnip.url);
        const article = await scr.scrapeArticleBody(emptyArticleSnip);
        if (article === null) continue;

        console.log('Article properties identified:');
        console.log('| Site: ' + article.site);
        console.log('| URL: ' + article.url);
        console.log('| Title: ' + article.title);
        console.log('| Category: ' + article.category);
        console.log('| Content: ' + article.content.substring(0, Math.min(100, article.content.length)) + '...');
        console.log('| Timestamp: ' + article.timestamp);
        console.log('| TTS Key: ' + article.key);

        const ttsFilenameTitle = article.id + '-title.wav';
        const ttsFilenameContent = article.id + '-content.wav';

        try {
            articleContainerInterface.items.upsert(article);
            //(article);       // <-- sometimes causes a bug
            // context.extraOutputs.set(articleOutput, article);   // <-- also causes a bug (most of the time)
                                                                   // god fucking dammit
        } catch {
            console.log("Error uploading to the file to Azure Blob Storage -- I do not know why this is.");
            continue;
        }

        const titleTTSContent = article.category + ". " + article.title;
        generateTTS(titleTTSContent, ttsFilenameTitle, async () => {
            console.log(`Article "${article.title}" TTS title file created "${ttsFilenameTitle}"`);
            uploadTTS(ttsFilenameTitle).then(() => removeFile(ttsFilenameTitle));

            generateTTS(article.content, ttsFilenameContent, async () => {
                console.log(`Article "${article.title}" TTS content file created "${ttsFilenameContent}"`);
                uploadTTS(ttsFilenameContent).then(() => removeFile(ttsFilenameContent));
            });
        });
    }
}

app.timer('timerTriggerScraperProcess', {
    // schedule: '*/30 * * * * *',  // every 30 seconds
    schedule: '0 */4 * * *',     // every 4 hours
    runOnStartup: true,
    handler: timerTrigger,
    extraInputs: [articleDirectoriesInput, queryArticleLinks],
    extraOutputs: []
});
