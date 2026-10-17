import { isAllowedCorsOrigin } from "../src/common/cors-policy";

const allowed = [
  "https://spmb.alfida.or.id",
  "https://auth.alfida.or.id",
  "https://sim.alfida.or.id",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

for (const origin of [
  "https://spmb.alfida.or.id",
  "https://admin.alfida.or.id",
  "http://localhost:3000",
]) {
  if (!isAllowedCorsOrigin(origin, allowed)) {
    throw new Error(`expected ${origin} to be an allowed CORS origin`);
  }
}

for (const origin of [
  "https://spmb.alfida.or.id.evil.test",
  "https://alfida.or.id.evil.test",
  "https://evilalfida.or.id",
  "https://example.test",
]) {
  if (isAllowedCorsOrigin(origin, allowed)) {
    throw new Error(`expected ${origin} to be rejected by CORS policy`);
  }
}

console.log("SPMB CORS policy contract passed");
