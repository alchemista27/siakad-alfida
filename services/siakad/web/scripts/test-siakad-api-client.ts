import assert from "node:assert/strict";
import { siakadApiFetch } from "../src/lib/api";

async function run() {
  const originalFetch = globalThis.fetch;
  const requestHeaders: Headers[] = [];

  try {
    globalThis.fetch = (async (_input, init) => {
      requestHeaders.push(new Headers(init?.headers));
      return new Response("plain success", {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    }) as typeof fetch;

    const plainResult = await siakadApiFetch<string>("/health");
    assert.equal(plainResult, "plain success", "plain-text success responses must not throw JSON parsing errors");

    globalThis.fetch = (async (_input, init) => {
      requestHeaders.push(new Headers(init?.headers));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    await siakadApiFetch("/upload-intent", { method: "POST", body: new FormData() });
    assert.equal(requestHeaders.at(-1)?.has("Content-Type") ?? false, false, "FormData requests must allow fetch to set multipart content boundaries");

    globalThis.fetch = (async () => new Response(JSON.stringify({ error: { message: "Nested failure" } }), {
      status: 422,
      headers: { "content-type": "application/problem+json" },
    })) as typeof fetch;

    await assert.rejects(
      () => siakadApiFetch("/unit-identity/me"),
      (error: unknown) => error instanceof Error && error.message === "Nested failure",
      "structured +json errors must expose their nested message",
    );

    console.log("SIAKAD API client contract passed");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

void run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
