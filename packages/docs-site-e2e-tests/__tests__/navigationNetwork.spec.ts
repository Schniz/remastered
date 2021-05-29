import { createBrowserBeforeAndAfter } from "./utils";
import "expect-puppeteer";

const browser = createBrowserBeforeAndAfter();

test("going through history does not re-fetch data", async () => {
  // initial page will not be "clicked"
  // but will be used to determine what's in the history stack
  const pagesToVisit = [`What is Remastered`, `Getting Started`, `Sessions`];

  const page = await browser.newPage();
  await page.goto("http://localhost:3000/docs");
  await expect(page).toMatchElement("title", {
    text: new RegExp(`${pagesToVisit[0]}`),
  });

  const allRequests: string[] = [];
  page.on("request", (request) => {
    allRequests.push(request.url());
  });

  for (const pageToVisit of pagesToVisit.slice(1)) {
    await Promise.all([
      page.waitForResponse((res) => res.url().endsWith(".json")),
      expect(page).toClick("a", { text: pageToVisit }),
    ]);
  }

  const historyRequests: string[] = [];
  page.on("request", (request) => {
    historyRequests.push(request.url());
  });

  for (const historyItem of [...pagesToVisit].reverse().slice(1)) {
    await page.goBack();
    await expect(page).toMatchElement("title", {
      text: new RegExp(`${historyItem}`),
    });
  }

  expect(historyRequests).toEqual([]);
  expect(allRequests).toMatchInlineSnapshot(`
Array [
  "http://localhost:3000/docs/welcome:getting-started.json",
  "http://localhost:3000/docs/concepts:sessions.json",
]
`);
});
