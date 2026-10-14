import { z } from "zod";

export const CreateUserManualSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().optional().nullable(),
  password: z.string().min(8, "Password minimal 8 karakter"),
  roles: z.array(
    z.object({
      app: z.string(),
      role: z.string(),
      unitId: z.string().uuid().optional().nullable(),
      departmentId: z.string().uuid().optional().nullable(),
    })
  ).min(1, "Minimal harus memilih satu peran"),
});

export type CreateUserManualDto = z.infer<typeof CreateUserManualSchema>;

export const AddRoleSchema = z.object({
  app: z.string(),
  role: z.string(),
  unitId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
});

export type AddRoleDto = z.infer<typeof AddRoleSchema>;

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password baru minimal 8 karakter"),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export const BatchImportUsersSchema = z.object({
  users: z.array(
    z.object({
      fullName: z.string(),
      email: z.string().email(),
      phone: z.string().optional().nullable(),
      role: z.string(),
      app: z.string().default("simpeg"),
      unitId: z.string().uuid().optional().nullable(),
      password: z.string().optional().nullable(),
    })
  ).min(1, "Daftar pengguna tidak boleh kosong"),
});

export type BatchImportUsersDto = z.infer<typeof BatchImportUsersSchema>;
