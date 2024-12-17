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

export async function pullPageContent(url: string): Promise<string> {
    await scraper.page.goto(url, { waitUntil: "networkidle2" });
    const selector = 'body';
    await scraper.page.waitForSelector(selector)
    // const data = await scraper.page.$eval(selector, (el) => el.textContent || '');
    // const data = await scraper.page.content();
    // const data = await scraper.page.evaluate(() =>  document.documentElement.outerHTML);

    const data = await scraper.page.evaluate(() => {
        // for (const elem of document.body.querySelectorAll('script')) elem.remove();
        // for (const elem of document.body.querySelectorAll('iframe')) elem.remove();
        // for (const elem of document.body.querySelectorAll('style')) elem.remove();
        // return document.body.innerHTML;
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

    console.log("Data: " + data);

    await llm.initLLMIfNull();
    await llm.sendMessage("Please filter the linkes to only be the ones that are for articles: " + data)
    const run = await llm.beginResponse();
    const result = await llm.getResult(run);

    // console.log(JSON.stringify(result));

    // return result;
    return JSON.stringify(result);
}

export async function closeScraper(scraper: Scraper): Promise<void> {
    await scraper.browser.close();
    scraper = null;
}
  