import { createBrowserBeforeAndAfter } from "./utils";
import "expect-puppeteer";
import { getDocument, queries, waitFor } from "pptr-testing-library";

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

  expect(response.status()).toBe(500);
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

  expect(response.status()).toBe(500);
  await expect(page).toMatchElement("h1", {
    text: /This is an ErrorBoundary/,
  });
  await expect(page).toMatchElement("p", {
    text: /This is a string so we will skip the mid-term error boundary/,
  });
});

describe("loaders", () => {
  test("does not throw on a successful loader", async () => {
    const page = await browser.newPage();
    const response = await page.goto(
      "http://localhost:3000/innerCanThrow/parse-integer-10"
    );
    expect(response.status()).toBe(200);
    await expect(page).toMatchElement("h1", {
      text: /The inner outlet can throw/,
    });
    await expect(page).toMatchElement("p", {
      text: /This is an actual integer! 10/,
    });
  });

  test("throws when loaders throw 1", async () => {
    const page = await browser.newPage();
    const response = await page.goto(
      "http://localhost:3000/innerCanThrow/parse-integer-hello"
    );
    expect(response.status()).toBe(500);
    await expect(page).toMatchElement("h1", {
      text: /The inner outlet can throw/,
    });
    await expect(page).toMatchElement("p", {
      text: /Can't parse: The given value was not a number/,
    });
  });

  test("throws when loaders throw 1", async () => {
    const page = await browser.newPage();
    const response = await page.goto(
      "http://localhost:3000/innerCanThrow/parse-integer-3.14"
    );
    expect(response.status()).toBe(500);
    await expect(page).toMatchElement("h1", {
      text: /The inner outlet can throw/,
    });
    await expect(page).toMatchElement("p", {
      text: /Can't parse: Error: The given value was not an integer/,
    });
  });
});

describe("navigation", () => {
  test("can navigate between a successful state to unsuccessful one and return", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/innerCanThrow");
    await expect(page).toClick("a", { text: "backend throws an error" });
    await expect(page).toMatchElement("p", {
      text: /Can't parse: Error: The given value was not an integer/,
    });
    await expect(page).toClick("a", { text: "backend throws a string" });
    await expect(page).toMatchElement("p", {
      text: /Can't parse: The given value was not a number/,
    });
    await expect(page).toClick("a", { text: /doesn't throw/i });
    await expect(page).toMatchElement("p", {
      text: /I don't throw/,
    });
  });

  test("back/forward is working", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/innerCanThrow");
    {
      const $document = await getDocument(page);
      await (
        await queries.getByText($document, `backend throws an error`)
      ).click();

      await waitFor(() =>
        queries.getByText(
          $document,
          /Can't parse: Error: The given value was not an integer/
        )
      );
      await (
        await queries.getByText($document, `backend throws a string`)
      ).click();
      await waitFor(() =>
        queries.getByText(
          $document,
          /Can't parse: The given value was not a number/
        )
      );
      await Promise.all([page.waitForNavigation(), page.goBack()]);
    }

    const [, response] = await Promise.all([
      page.waitForNavigation(),
      page.reload(),
    ]);
    expect(response.status()).toEqual(500);
    {
      const $document = await getDocument(page);
      await waitFor(() =>
        queries.getByText(
          $document,
          /Can't parse: Error: The given value was not an integer/
        )
      );
      await Promise.all([page.waitForNavigation(), page.goForward()]);

      await waitFor(() =>
        queries.getByText(
          $document,
          /Can't parse: The given value was not a number/
        )
      ).catch(async () => {
        console.log(await page.$eval("body", (x) => x.innerHTML));
      });
    }
  });
});
