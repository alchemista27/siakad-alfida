import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export const UpdateFoundationSchema = z.object({
  foundationName: z.string().min(2, "Nama yayasan minimal 2 karakter"),
  logoUrl: z.string().url("URL Logo tidak valid").optional().nullable().or(z.literal("")),
  faviconUrl: z.string().url("URL Favicon tidak valid").optional().nullable().or(z.literal("")),
  chairmanName: z.string().optional().nullable().or(z.literal("")),
  chairmanSignatureUrl: z.string().url("URL Tanda tangan tidak valid").optional().nullable().or(z.literal("")),
  bankName: z.string().optional().nullable().or(z.literal("")),
  bankAccountNumber: z.string().optional().nullable().or(z.literal("")),
  bankAccountHolder: z.string().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable().or(z.literal("")),
  email: z.string().email("Format email tidak valid").optional().nullable().or(z.literal("")),
}).strict();

export type UpdateFoundationDto = z.infer<typeof UpdateFoundationSchema>;

export function parseUpdateFoundationDto(input: unknown): UpdateFoundationDto {
  const parsed = UpdateFoundationSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException({
      message: "Payload pengaturan yayasan tidak valid.",
      errors: parsed.error.flatten(),
    });
  }
  return parsed.data;
}
