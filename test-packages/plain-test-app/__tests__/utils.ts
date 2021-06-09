import puppeteer, { Browser, Page } from "puppeteer";
import { mkdirp } from "fs-extra";

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
    await mkdirp(`tmp/test-screenshots`);

    const pages = [...pagesToDelete];
    pagesToDelete.clear();
    for (const page of pages) {
      const testName = expect
        .getState()
        .currentTestName.replace(/[^a-z]/g, "-");
      await page.screenshot({
        fullPage: true,
        path: `tmp/test-screenshots/${testName}.png`,
      });
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
