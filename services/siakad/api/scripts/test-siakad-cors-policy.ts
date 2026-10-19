import { isAllowedCorsOrigin } from "../src/common/cors-policy";

const allowedOrigins = [
  "https://siakad.alfida.or.id",
  "https://auth.alfida.or.id",
  "http://localhost:3000",
  "http://localhost:3001",
];

for (const origin of [
  undefined,
  "https://siakad.alfida.or.id",
  "https://auth.alfida.or.id",
  "http://localhost:3000",
]) {
  if (!isAllowedCorsOrigin(origin, allowedOrigins)) {
    throw new Error(`expected ${origin ?? "no origin"} to be allowed`);
  }
}

for (const origin of [
  "https://admin.alfida.or.id",
  "https://alfida.or.id",
  "http://admin.alfida.or.id",
  "https://siakad.alfida.or.id.evil.test",
  "https://alfida.or.id.evil.test",
  "https://evilalfida.or.id",
  "https://example.test",
  "not an origin",
]) {
  if (isAllowedCorsOrigin(origin, allowedOrigins)) {
    throw new Error(`expected ${origin} to be denied`);
  }
}

console.log("SIAKAD CORS policy contract passed");
