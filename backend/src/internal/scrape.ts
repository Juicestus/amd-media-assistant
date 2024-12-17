// npm i puppeteer-core # Alternatively, install as a library, without downloading Chrome.
import * as ppt from "puppeteer";

export interface Scraper {
    browser: ppt.Browser;
    page: ppt.Page;
};

export async function initScraperIfNull(scraper: Scraper | null): Promise<Scraper> {
    if (scraper === null) {
        const browser = await ppt.launch();
        const page = await browser.newPage();
        scraper = { browser, page };
    }
    return scraper;
}

export async function pullPageContent(scraper: Scraper, url: string): Promise<string> {
    await scraper.page.goto(url, { waitUntil: "networkidle2" });
    const selector = 'body';
    await scraper.page.waitForSelector(selector)
    // const data = await scraper.page.$eval(selector, (el) => el.textContent || '');
    // const data = await scraper.page.content();
    // const data = await scraper.page.evaluate(() =>  document.documentElement.outerHTML);
    const data = await scraper.page.evaluate(() => {
        for (const script of document.body.querySelectorAll('script')) script.remove();
        return document.body.innerHTML;
      });

    return data;
}

export async function closeScraper(scraper: Scraper): Promise<void> {
    await scraper.browser.close();
    scraper = null;
}
  