import { createBrowserBeforeAndAfter } from "./utils";
import "expect-puppeteer";

const browser = createBrowserBeforeAndAfter();

test("going through history does not re-fetch data", async () => {
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/docs");
  const allRequests: string[] = [];
  page.on("request", (request) => {
    allRequests.push(request.url());
  });

  await Promise.all([
    page.waitForResponse((res) => res.url().endsWith(".json")),
    expect(page).toClick("a", { text: `Getting Started` }),
  ]);
  await Promise.all([
    page.waitForResponse((res) => res.url().endsWith(".json")),
    expect(page).toClick("a", { text: `Session` }),
  ]);

  const historyRequests: string[] = [];
  page.on("request", (request) => {
    historyRequests.push(request.url());
  });

  await page.goBack();
  await expect(page).toMatchElement("title", {
    text: /Getting Started/,
  });

  await page.goBack();
  await expect(page).toMatchElement("title", {
    text: /What is Remastered/,
  });

  expect(historyRequests).toEqual([]);
  expect(allRequests).toMatchInlineSnapshot(`
Array [
  "http://localhost:3000/docs/welcome:getting-started.json",
  "http://localhost:3000/docs/concepts:sessions.json",
]
`);
});
