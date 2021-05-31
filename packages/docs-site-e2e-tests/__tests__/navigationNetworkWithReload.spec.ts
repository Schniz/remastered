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

  await page.reload();

  const historyRequests: string[] = [];
  page.on("request", (request) => {
    historyRequests.push(request.url());
  });

  await page.goBack();
  await page.goBack();

  await expect(page).toMatchElement("title", {
    text: /What is Remastered/,
  });
  expect(historyRequests).toMatchInlineSnapshot(`
Array [
  "http://localhost:3000/assets/docs.js",
  "http://localhost:3000/assets/@path.js",
  "http://localhost:3000/docs.json",
  "http://localhost:3000/docs/welcome:what-is-remastered.json",
]
`);
});
