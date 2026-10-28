import { z } from "zod";

const cloudinaryAvatarUrl = z
  .string()
  .url("URL foto profil tidak valid")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com";
    } catch {
      return false;
    }
  }, "Foto profil harus berasal dari Cloudinary");

export const UpdateOwnProfileSchema = z.object({
  fullName: z.string().trim().min(3, "Nama lengkap minimal 3 karakter").max(200, "Nama lengkap maksimal 200 karakter"),
  email: z.string().trim().email("Format email tidak valid").max(255),
  phone: z.string().trim().min(8, "Nomor HP minimal 8 digit").max(30, "Nomor HP maksimal 30 karakter").nullable(),
  avatarUrl: cloudinaryAvatarUrl.nullable(),
});

export type UpdateOwnProfileDto = z.infer<typeof UpdateOwnProfileSchema>;

export const ChangeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter").max(128, "Password baru maksimal 128 karakter"),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Konfirmasi password baru tidak sama",
    path: ["confirmPassword"],
  });

export type ChangeOwnPasswordDto = z.infer<typeof ChangeOwnPasswordSchema>;

export function parseUpdateOwnProfile(body: unknown): UpdateOwnProfileDto {
  const result = UpdateOwnProfileSchema.safeParse(body);
  if (!result.success) throw new Error(result.error.issues[0]?.message || "Data profil tidak valid");
  return result.data;
}

export function parseChangeOwnPassword(body: unknown): ChangeOwnPasswordDto {
  const result = ChangeOwnPasswordSchema.safeParse(body);
  if (!result.success) throw new Error(result.error.issues[0]?.message || "Data password tidak valid");
  return result.data;
}
