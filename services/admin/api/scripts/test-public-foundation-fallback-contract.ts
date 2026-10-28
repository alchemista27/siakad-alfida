import assert from "node:assert/strict";
import { FoundationService } from "../src/foundation/foundation.service";

const stored = {
  foundationName: "Yayasan Alfida",
  logoUrl: "https://res.cloudinary.com/example/image/upload/foundation/logo/logo.png",
  faviconUrl: null,
  chairmanName: "Ahmad Yusuf",
  chairmanSignatureUrl: "https://res.cloudinary.com/example/image/upload/foundation/chairman-signature/signature.png",
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
  assert.equal(settings.chairmanName, "Ahmad Yusuf", "public branding must expose the named foundation fallback signer");
  assert.equal(settings.chairmanSignatureUrl, stored.chairmanSignatureUrl, "public branding must expose the foundation fallback signature asset");
  console.log("Admin public foundation fallback contract passed");
}

void main();
