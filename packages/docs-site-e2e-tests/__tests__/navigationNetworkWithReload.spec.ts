import { createBrowserBeforeAndAfter } from "./utils";
import "expect-puppeteer";

const browser = createBrowserBeforeAndAfter();

test.only("refresh after history will re-fetch data", async () => {
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/docs");

  await Promise.all([
    page.waitForResponse((res) => res.url().endsWith(".json")),
    expect(page).toClick("a", { text: "Getting Started" }),
  ]);

  await Promise.all([
    page.waitForResponse((res) => res.url().endsWith(".json")),
    expect(page).toClick("a", { text: "Remastered" }),
  ]);

  await expect(page).toMatchElement("title", { text: "Remastered" });

  await Promise.all([page.waitForNavigation(), page.reload()]);

  const historyRequests: string[] = [];
  page.on("request", (request) => {
    historyRequests.push(request.url());
  });

  await page.goBack();
  await page.goBack();

  await expect(page).toMatchElement("title", {
    text: /What is Remastered/,
    timeout: 1000,
  });
  expect(historyRequests).toMatchInlineSnapshot(`
Array [
  "http://localhost:3000/assets/docs.js",
  "http://localhost:3000/assets/Spinner.js",
  "http://localhost:3000/assets/@file.js",
  "http://localhost:3000/docs.loader.json",
  "http://localhost:3000/docs/welcome/what-is-remastered.loader.json",
]
`);
});
