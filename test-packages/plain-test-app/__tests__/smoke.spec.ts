import { createBrowserBeforeAndAfter } from "./utils";
import "expect-puppeteer";

const browser = createBrowserBeforeAndAfter();

jest.setTimeout(10000);

test("smoke", async () => {
  const page = await browser.newPage();
  const response = await page.goto("http://localhost:3000");

  expect(response.status()).toBe(200);
  await expect(page).toMatchElement("h1", { text: "Home" });
});
