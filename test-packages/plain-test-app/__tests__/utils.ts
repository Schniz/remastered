import puppeteer, { Browser, Page } from "puppeteer";

export function createBrowserBeforeAndAfter() {
  let browser: { current?: Browser } = {};
  beforeAll(async () => {
    browser.current = await puppeteer.launch();
  });
  afterAll(async () => {
    browser.current?.close();
    browser.current = undefined;
  });

  const pagesToDelete = new Set<Page>();

  afterEach(async () => {
    const pages = [...pagesToDelete];
    pagesToDelete.clear();
    for (const page of pages) {
      await page.close();
    }
  });

  return {
    newPage: async () => {
      const page = await browser.current!.newPage();
      pagesToDelete.add(page);
      return page;
    },
  };
}
