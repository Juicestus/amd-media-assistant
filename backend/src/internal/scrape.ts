// npm i puppeteer-core # Alternatively, install as a library, without downloading Chrome.
import * as ppt from "puppeteer";
import * as llm from "./llm";

export interface Scraper {
    browser: ppt.Browser;
    page: ppt.Page;
};

let scraper: Scraper | null = null;

export async function initScraperIfNull() {
    if (scraper === null) {
        const browser = await ppt.launch();
        const page = await browser.newPage();
        scraper = { browser, page };
    }
}

export async function grabArticleLinksFromPage(url: string): Promise<string[]> {
    await scraper.page.goto(url, { waitUntil: "networkidle2" });
    const selector = 'body';
    await scraper.page.waitForSelector(selector)
    const data = await scraper.page.evaluate(() => {
        const linkSet: Set<string> = new Set<string>();
        for (const link of document.body.querySelectorAll('a')) {
            linkSet.add(link.toString());
        }
        let links = "";
        linkSet.forEach(link => {
            links += link + '\n';
        });
        return links;
      });
    await llm.initLLMIfNull();
    await llm.sendMessage("Please filter the links to only be the ones that are for articles. Please return your response in a json object with single entry \"articles\" which is a list of the article links as strings.\n" + data)
    const run = await llm.beginResponse();
    const result = await llm.getResult(run);
    // console.log(JSON.stringify(result));
    const parsed = JSON.parse(result[0]['text']['value']);
    return parsed['articles'];
}

export async function closeScraper(scraper: Scraper): Promise<void> {
    await scraper.browser.close();
    scraper = null;
}
  