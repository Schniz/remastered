import { stringify, parse, setup } from "./megajson";
import { globalPatch } from "./globalPatch";

it("serializes a response", async () => {
  globalPatch();
  setup();

  const str = await stringify({
    responseA: new Response("Hello, world", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    }),
    responseB: new Response(JSON.stringify({ hello: "world" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }),
  });

  expect(typeof str).toBe("string");

  const parsed = parse(str) as any;

  expect(parsed.responseA).toBeInstanceOf(Response);
  expect(await parsed.responseA.text()).toEqual("Hello, world");
  expect(parsed.responseA.status).toBe(200);
  expect(parsed.responseA.headers.get("content-type")).toBe("text/plain");

  expect(parsed.responseB).toBeInstanceOf(Response);
  expect(await parsed.responseB.json()).toEqual({ hello: "world" });
  expect(parsed.responseB.status).toBe(500);
  expect(parsed.responseB.headers.get("content-type")).toBe("application/json");
});

it("works with plain strings", async () => {
  globalPatch();
  setup();

  const str = await stringify("hello world");
  expect(parse(str)).toEqual("hello world");
});
