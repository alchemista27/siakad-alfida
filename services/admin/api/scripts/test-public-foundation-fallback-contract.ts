import assert from "node:assert/strict";
import { FoundationService } from "../src/foundation/foundation.service";

const stored = {
  foundationName: "Yayasan Alfida",
  logoUrl: "https://res.cloudinary.com/example/image/upload/foundation/logo/logo.png",
  faviconUrl: null,
};

const prisma: any = {
  foundationSettings: {
    findFirst: async ({ select }: { select: Record<string, boolean> }) => Object.fromEntries(
      Object.keys(select).filter((key) => select[key]).map((key) => [key, stored[key as keyof typeof stored]]),
    ),
  },
};

async function main() {
  const settings = await new FoundationService(prisma).getPublicSettings();
  assert.equal(settings.foundationName, "Yayasan Alfida");
  assert.equal(settings.logoUrl, stored.logoUrl);
  assert.equal("chairmanName" in settings, false, "public branding must not expose internal signatory identity");
  assert.equal("chairmanSignatureUrl" in settings, false, "public branding must not expose a signature asset");
  console.log("Admin public foundation branding contract passed");
}

void main();
