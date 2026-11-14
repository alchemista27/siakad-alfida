export type LetterheadKind = "unit" | "foundation";

export type InstitutionalLetterheadInput = {
  letterheadKind: LetterheadKind;
  unitName: string;
  unitAddress: string | null;
  unitPhone: string | null;
  unitEmail: string | null;
  unitLogoUrl: string | null;
  foundationName: string;
  foundationAddress: string | null;
  foundationPhone: string | null;
  foundationEmail: string | null;
  foundationLogoUrl: string | null;
};

export type PreparedLetterheadAssets = {
  unitLogo: Buffer | null;
  foundationLogo: Buffer | null;
};

export const LETTERHEAD_LEFT = 56;
export const LETTERHEAD_RIGHT = 539;
export const LETTERHEAD_LOGO_SIZE = 64;
export const LETTERHEAD_TOP = 42;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const PDF_FONT_REGULAR = "LiberationSerifRegular";
const PDF_FONT_BOLD = "LiberationSerifBold";

export function isSupportedLetterheadRaster(bytes: Uint8Array) {
  return (bytes.length >= PNG_SIGNATURE.length && PNG_SIGNATURE.every((byte, index) => bytes[index] === byte))
    || (bytes.length >= JPEG_SIGNATURE.length && JPEG_SIGNATURE.every((byte, index) => bytes[index] === byte));
}

function cloudinaryPng(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    if (parsed.hostname === "res.cloudinary.com" && parsed.pathname.includes("/image/upload/")) {
      parsed.pathname = parsed.pathname.replace("/image/upload/", "/image/upload/f_png/");
      return parsed.toString();
    }
    return parsed.hostname === "s3.alfida.or.id" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

async function optionalImageBytes(url: string | null) {
  if (!url?.trim()) return null;
  const normalized = cloudinaryPng(url);
  if (!normalized) return null;
  try {
    const response = await fetch(normalized, { cache: "no-store", signal: AbortSignal.timeout(5_000) });
    if (!response.ok) return null;
    const declaredLength = Number(response.headers.get("content-length") || "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return bytes.length <= MAX_IMAGE_BYTES && isSupportedLetterheadRaster(bytes) ? bytes : null;
  } catch {
    return null;
  }
}

export async function prepareLetterheadAssets(input: InstitutionalLetterheadInput): Promise<PreparedLetterheadAssets> {
  const [unitLogo, foundationLogo] = await Promise.all([
    input.letterheadKind === "unit" ? optionalImageBytes(input.unitLogoUrl) : Promise.resolve(null),
    optionalImageBytes(input.foundationLogoUrl),
  ]);
  return { unitLogo, foundationLogo };
}

export function safeLetterheadText(value: string | null | undefined) {
  return (value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function contactLine(values: Array<string | null>) {
  return values.map(safeLetterheadText).filter(Boolean).join(" • ");
}

export function getLetterheadIssuerName(input: InstitutionalLetterheadInput) {
  const primaryName = input.letterheadKind === "unit" ? input.unitName : input.foundationName;
  return safeLetterheadText(primaryName) || "Yayasan Alfida";
}

export function drawInstitutionalLetterhead(
  document: PDFKit.PDFDocument,
  input: InstitutionalLetterheadInput,
  assets: PreparedLetterheadAssets,
  options: { left?: number; right?: number; top?: number } = {},
): { dividerY: number } {
  const left = options.left ?? LETTERHEAD_LEFT;
  const right = options.right ?? LETTERHEAD_RIGHT;
  const top = options.top ?? LETTERHEAD_TOP;
  const isUnit = input.letterheadKind === "unit";

  if (isUnit && assets.unitLogo) document.image(assets.unitLogo, left, top, { fit: [LETTERHEAD_LOGO_SIZE, LETTERHEAD_LOGO_SIZE] });
  if (assets.foundationLogo) {
    const foundationLogoX = isUnit ? right - LETTERHEAD_LOGO_SIZE : left;
    document.image(assets.foundationLogo, foundationLogoX, top, { fit: [LETTERHEAD_LOGO_SIZE, LETTERHEAD_LOGO_SIZE] });
  }

  const textLeft = (isUnit ? assets.unitLogo : assets.foundationLogo) ? left + LETTERHEAD_LOGO_SIZE + 10 : left;
  const textRight = isUnit ? right - LETTERHEAD_LOGO_SIZE - 10 : right;
  const textWidth = Math.max(120, textRight - textLeft);
  const name = getLetterheadIssuerName(input);
  const contacts = isUnit
    ? contactLine([input.unitAddress, input.unitPhone, input.unitEmail])
    : contactLine([input.foundationAddress, input.foundationPhone, input.foundationEmail]);

  const nameHeight = document.font(PDF_FONT_BOLD).fontSize(14).heightOfString(name, { width: textWidth, align: "center" });
  document.font(PDF_FONT_BOLD).fontSize(14).fillColor("#1f2933").text(name, textLeft, top + 4, { width: textWidth, align: "center" });

  const contactY = top + 8 + nameHeight;
  const contactHeight = contacts
    ? document.font(PDF_FONT_REGULAR).fontSize(7.5).heightOfString(contacts, { width: textWidth, align: "center" })
    : 0;
  if (contacts) {
    document.font(PDF_FONT_REGULAR).fontSize(7.5).fillColor("#1f2933").text(contacts, textLeft, contactY, { width: textWidth, align: "center" });
  }

  const dividerY = Math.max(top + LETTERHEAD_LOGO_SIZE + 10, contactY + contactHeight + 12);
  document.moveTo(left, dividerY).lineTo(right, dividerY).lineWidth(1.2).strokeColor("#454545").stroke();
  document.moveTo(left, dividerY + 3).lineTo(right, dividerY + 3).lineWidth(0.45).strokeColor("#454545").stroke();
  return { dividerY };
}
