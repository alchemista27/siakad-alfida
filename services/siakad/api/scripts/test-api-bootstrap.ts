import { configureApp, SIAKAD_ALLOWED_ORIGINS } from "../src/main";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

let globalPrefix = "";
let corsOptions: any;
let usedMiddleware = 0;
const app = {
  use: () => {
    usedMiddleware += 1;
  },
  setGlobalPrefix: (prefix: string) => {
    globalPrefix = prefix;
  },
  enableCors: (options: unknown) => {
    corsOptions = options;
  },
};

configureApp(app as never);
assert(usedMiddleware === 1, "API must install cookie parsing before its guards run");
assert(globalPrefix === "api", "API must use the /api global prefix");
assert(corsOptions?.credentials === true, "API CORS must support credentialed SSO cookies");
assert(SIAKAD_ALLOWED_ORIGINS.includes("https://siakad.alfida.or.id"), "SIAKAD origin must be explicit");

let allowed: boolean | undefined;
corsOptions.origin("https://siakad.alfida.or.id.evil.test", (_error: unknown, result: boolean) => {
  allowed = result;
});
assert(allowed === false, "credentialed CORS must reject lookalike origins");

console.log("SIAKAD API bootstrap contract passed");
