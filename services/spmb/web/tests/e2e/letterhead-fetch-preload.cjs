const originalFetch = globalThis.fetch;
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPgr8/FihiGlgQAbbA+wbH5oDAAAAAASUVORK5CYII=",
  "base64",
);

globalThis.fetch = async function letterheadE2eFetch(input, init) {
  const requestUrl = new URL(typeof input === "string" ? input : input.url);
  if (requestUrl.protocol === "https:" && requestUrl.hostname === "res.cloudinary.com") {
    return new Response(png, {
      status: 200,
      headers: {
        "content-type": "image/png",
        "content-length": String(png.length),
        "cache-control": "no-store",
      },
    });
  }
  return originalFetch(input, init);
};
