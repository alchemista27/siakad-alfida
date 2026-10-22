import assert from "node:assert/strict";
import { validateCloudinaryEvidence } from "../src/evidence/ymq-cloudinary-evidence.policy";

const groupId = "11111111-1111-4111-8111-111111111111";
const sessionId = "22222222-2222-4222-8222-222222222222";
const secureUrl = `https://res.cloudinary.com/hb1ropwm/image/upload/v1/siyaum/ymq/${groupId}/${sessionId}/progress-proof.webp`;
const publicId = `siyaum/ymq/${groupId}/${sessionId}/progress-proof`;
const options = { cloudName: "hb1ropwm", groupId, sessionId, maxBytes: 5_000_000 };

assert.equal(validateCloudinaryEvidence({ secureUrl, publicId, resourceType: "image", bytes: 12 }, options).valid, true);
assert.equal(validateCloudinaryEvidence({ secureUrl: secureUrl.replace(groupId, "33333333-3333-4333-8333-333333333333"), publicId, resourceType: "image", bytes: 12 }, options).valid, false);
assert.equal(validateCloudinaryEvidence({ secureUrl, publicId: publicId.replace(sessionId, "33333333-3333-4333-8333-333333333333"), resourceType: "image", bytes: 12 }, options).valid, false);
assert.equal(validateCloudinaryEvidence({ secureUrl: secureUrl.replace("hb1ropwm", "other-cloud"), publicId, resourceType: "image", bytes: 12 }, options).valid, false);
assert.equal(validateCloudinaryEvidence({ secureUrl: "https://evil.test/proof.webp", publicId, resourceType: "image", bytes: 12 }, options).valid, false);
assert.equal(validateCloudinaryEvidence({ secureUrl, publicId, resourceType: "image", bytes: 5_000_001 }, options).valid, false);
assert.equal(validateCloudinaryEvidence({ secureUrl, publicId, resourceType: "binary", bytes: 12 }, options).valid, false);

console.log("SIYAUM YMQ Cloudinary policy contract passed");
