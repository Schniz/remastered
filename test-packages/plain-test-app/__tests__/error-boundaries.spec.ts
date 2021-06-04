import { createBrowserBeforeAndAfter } from "./utils";
import "expect-puppeteer";

const browser = createBrowserBeforeAndAfter();

jest.setTimeout(10000);

test("does not throw", async () => {
  const page = await browser.newPage();
  const response = await page.goto("http://localhost:3000/innerCanThrow");

  expect(response.status()).toBe(200);
  await expect(page).toMatchElement("p", { text: /I don't throw/ });
});

test("throws but catched in outlet", async () => {
  const page = await browser.newPage();
  const response = await page.goto(
    "http://localhost:3000/innerCanThrow/throws"
  );

  expect(response.status()).toBe(200);
  await expect(page).toMatchElement("h1", {
    text: /The inner outlet can throw/,
  });
  await expect(page).toMatchElement("p", { text: /Haha, I throw!/ });
});

test("throws but catched ErrorBoundary", async () => {
  const page = await browser.newPage();
  const response = await page.goto(
    "http://localhost:3000/innerCanThrow/critical"
  );

  expect(response.status()).toBe(200);
  await expect(page).toMatchElement("h1", {
    text: /This is an ErrorBoundary/,
  });
  await expect(page).toMatchElement("p", {
    text: /This is a string so we will skip the mid-term error boundary/,
  });
});
