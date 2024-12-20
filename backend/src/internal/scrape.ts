// npm i puppeteer-core # Alternatively, install as a library, without downloading Chrome.
import * as ppt from "puppeteer";
import * as llm from "./llm";
import { Article, articleCategories } from "../functions/article";

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
    console.log("Scraped " + url + " found " + data.split('\n').length + " unique links");
    await llm.initLLMIfNull();
    await llm.sendMessage("Please filter the links to only be the ones that are for articles."
        + " Please return your response in a json object with single entry \"articles\" which"
        + " is a list of the article links as strings.\n" + data);
    const run = await llm.beginResponse();
    const result = await llm.getResult(run, "SCRAPE ARTICLE LINKS", url);
    // console.log(JSON.stringify(result));
    const parsed = JSON.parse(result[0]['text']['value']);
    return parsed['articles'];
}

export const siteFromUrl = (url: string) => {
    const p = url.split('/')[2].split('.');
    return p[p.length - 2] + '.' + p[p.length - 1];
}

export async function scrapeArticleFromLink(url: string): Promise<Article> {
    await scraper.page.goto(url, { waitUntil: "networkidle2" });
    const selector = 'body';
    await scraper.page.waitForSelector(selector)
    const data = await scraper.page.evaluate(() => {
        let textContent = "";
        for (const textElement of document.body.querySelectorAll('p, h1, h2, h3')) {
            textContent += textElement.innerHTML + '\n';
        }
        return textContent; 
      });

    console.log("Scraped " + url + " found " + data.length + " characters of text content");
    await llm.initLLMIfNull();
    await llm.sendMessage("Given the following article content, please output a json object with the"
        + " title of the article as a string, the category of the article from the set " 
        + JSON.stringify(articleCategories)
        + " as a string, and the content of the article as a string."
        // + " Please avoid modifying the content of the article, and rather remove irrelevant content."
        + "\n\n" + data);
    const run = await llm.beginResponse();
    const result = await llm.getResult(run, "SCRAPE ARTICLE CONTENT", url);
    // console.log(JSON.stringify(result));
    const parsed = JSON.parse(result[0]['text']['value']);
    // console.log(parsed);
    return {
        id: parsed['title'],
        url: url,
        site: siteFromUrl(url),
        title: parsed['title'],
        category: parsed['category'],
        content: parsed['content'],
        timestamp: Date.now()
    };
}

export async function closeScraper(scraper: Scraper): Promise<void> {
    await scraper.browser.close();
    scraper = null;
}
  