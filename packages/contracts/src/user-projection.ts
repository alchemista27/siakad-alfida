import { z } from "zod";

export const UserProjectionRoleSchema = z.object({
  app: z.enum(["siakad", "*"]),
  role: z.enum(["admin_unit", "guru", "wali_kelas", "supervisor_kesiswaan", "orang_tua", "super_admin"]),
  unitId: z.string().uuid().nullable(),
  departmentId: z.null(),
}).strict().superRefine((value, ctx) => {
  const isSuperAdmin = value.app === "*" && value.role === "super_admin";
  const isSiakadRole = value.app === "siakad" && value.role !== "super_admin";
  if (!isSuperAdmin && !isSiakadRole) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Peran proyeksi pengguna tidak valid." });
  }
  if ((value.role === "admin_unit" || value.role === "guru" || value.role === "wali_kelas" || value.role === "supervisor_kesiswaan") && !value.unitId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Peran SIAKAD ini harus memiliki unit." });
  }
  if ((value.role === "orang_tua" || value.role === "super_admin") && value.unitId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Peran global tidak boleh memiliki unit." });
  }
});

export const UserProjectionPayloadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  email: z.string().email().max(255).nullable(),
  phone: z.string().trim().min(1).max(30).nullable(),
  roles: z.array(UserProjectionRoleSchema),
  status: z.enum(["active", "archived"]),
  sourceUpdatedAt: z.string().datetime(),
}).strict();

export type UserProjectionPayload = z.infer<typeof UserProjectionPayloadSchema>;
