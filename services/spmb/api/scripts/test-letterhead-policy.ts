import assert from "node:assert/strict";
import { resolveLetterheadKind } from "../src/letters/letterhead-policy";

const complete = {
  unitName: "SDIT Iqra",
  address: "Jl. Pendidikan No. 1",
  phone: "021-123456",
  email: "admin@sdit.example",
  logoUrl: "https://res.cloudinary.com/example/image/upload/simpeg/unit/unit-1/logo/logo.png",
};

assert.equal(resolveLetterheadKind(complete), "unit");
assert.equal(resolveLetterheadKind({ ...complete, logoUrl: null }), "foundation");
assert.equal(resolveLetterheadKind({ ...complete, address: "   " }), "foundation");
assert.equal(resolveLetterheadKind({ ...complete, phone: null }), "foundation");
assert.equal(resolveLetterheadKind({ ...complete, email: "" }), "foundation");
assert.equal(resolveLetterheadKind({ ...complete, unitName: "" }), "foundation");

console.log("SPMB letterhead policy contract passed");
