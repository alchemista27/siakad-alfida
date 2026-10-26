import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { CrossVersionHttpExceptionFilter } from "../src/common/cross-version-http-exception.filter";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function createHost() {
  let statusCode: number | null = null;
  let payload: unknown = null;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(value: unknown) {
      payload = value;
      return this;
    },
  };

  return {
    host: {
      switchToHttp: () => ({ getResponse: () => response }),
    } as any,
    read: () => ({ statusCode, payload }),
  };
}

const authSdkRequire = createRequire(resolve(import.meta.dirname, "../../../../packages/auth-sdk/package.json"));
const { UnauthorizedException: AuthSdkUnauthorizedException } = authSdkRequire("@nestjs/common") as {
  UnauthorizedException: new (message: string) => Error;
};

const filter = new CrossVersionHttpExceptionFilter();
const compatible = createHost();
filter.catch(new AuthSdkUnauthorizedException("Autentikasi gagal: token tidak ditemukan"), compatible.host);
assert(compatible.read().statusCode === 401, "Nest v10 exception from auth-sdk must preserve HTTP 401 in Nest v11 API");
assert(
  (compatible.read().payload as { message?: string }).message === "Autentikasi gagal: token tidak ditemukan",
  "compatible exception message must be preserved",
);

const unexpected = createHost();
filter.catch(new Error("database unavailable"), unexpected.host);
assert(unexpected.read().statusCode === 500, "unknown errors must remain HTTP 500");
assert(
  (unexpected.read().payload as { message?: string }).message === "Internal server error",
  "unknown errors must keep the generic production-safe message",
);

const mainSource = readFileSync(resolve(import.meta.dirname, "../src/main.ts"), "utf8");
assert(
  mainSource.includes("app.useGlobalFilters(new CrossVersionHttpExceptionFilter())"),
  "SPMB bootstrap must register the cross-version HTTP exception filter",
);

console.log("SPMB cross-version HTTP exception contract passed");
