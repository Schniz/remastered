import { createBrowserBeforeAndAfter } from "./utils";

const browser = createBrowserBeforeAndAfter();

test("smoke test", async () => {
  const page = await browser.newPage();
  await page.goto("http://localhost:3000");
  expect(await page.title()).toMatch(/^Remastered/);
});
