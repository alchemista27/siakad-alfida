import assert from "node:assert/strict";
import { drawInstitutionalLetterhead, getLetterheadIssuerName } from "../src/lib/letters/letterhead";

function createDocument() {
  const images: Array<{ x: number; y: number }> = [];
  const texts: string[] = [];
  const document: any = {
    font: () => document,
    fontSize: () => document,
    heightOfString: () => 16,
    fillColor: () => document,
    text: (value: string) => {
      texts.push(value);
      return document;
    },
    image: (_bytes: Buffer, x: number, y: number) => {
      images.push({ x, y });
      return document;
    },
    moveTo: () => document,
    lineTo: () => document,
    lineWidth: () => document,
    strokeColor: () => document,
    stroke: () => document,
  };
  return { document, images, texts };
}

const base = {
  unitName: "SDIT Iqra",
  unitAddress: "Jl. Unit No. 1",
  unitPhone: "021-111111",
  unitEmail: "unit@example.test",
  unitLogoUrl: null,
  foundationName: "Yayasan Alfida",
  foundationAddress: "Jl. Yayasan No. 1",
  foundationPhone: "021-999999",
  foundationEmail: "info@alfida.example",
  foundationLogoUrl: null,
};

const foundation = createDocument();
drawInstitutionalLetterhead(
  foundation.document,
  { ...base, letterheadKind: "foundation" },
  { unitLogo: null, foundationLogo: Buffer.from("foundation") },
);
assert.deepEqual(foundation.images, [{ x: 56, y: 42 }], "foundation header must place its logo on the left");
assert.equal(foundation.texts.includes("Yayasan Alfida"), true, "foundation header must display foundation identity");
assert.equal(foundation.texts.includes("SDIT Iqra"), false, "foundation fallback must not render unit identity");
assert.equal(getLetterheadIssuerName({ ...base, letterheadKind: "foundation" }), "Yayasan Alfida", "foundation fallback must use foundation name as issuer");
assert.equal(getLetterheadIssuerName({ ...base, letterheadKind: "unit" }), "SDIT Iqra", "unit letterhead must use unit name as issuer");

const unit = createDocument();
drawInstitutionalLetterhead(
  unit.document,
  { ...base, unitLogoUrl: "https://res.cloudinary.com/example/image/upload/simpeg/unit/unit-1/logo.png", letterheadKind: "unit" },
  { unitLogo: Buffer.from("unit"), foundationLogo: Buffer.from("foundation") },
);
assert.deepEqual(unit.images, [{ x: 56, y: 42 }, { x: 475, y: 42 }], "unit header must place unit left and foundation right");
assert.equal(unit.texts.includes("SDIT Iqra"), true, "unit header must display unit identity");

console.log("SPMB institutional letterhead layout contract passed");
