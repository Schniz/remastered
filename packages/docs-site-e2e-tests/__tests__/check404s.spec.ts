import { createBrowserBeforeAndAfter } from "./utils";
import "expect-puppeteer";

const browser = createBrowserBeforeAndAfter();

test("going directly to a category without a file results in 404", async () => {
  const page = await browser.newPage();
  const response = await page.goto("http://localhost:3000/docs/welcome");
  expect(response.status()).toEqual(404);
});
