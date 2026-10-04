import { prisma } from "@/lib/prisma";
import { UserUploadClient } from "@/components/admin/user-upload-client";
import { UserListClient } from "@/components/admin/user-list-client";
import { UserCreateClient } from "@/components/admin/user-create-client";

import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";

export default async function UserManagementPage() {
  await requireRole([UserRole.super_admin]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      roles: true
    }
  });

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-primary">Manajemen Pengguna</h1>
          <p className="text-sm font-body text-primary opacity-70 mt-1">Kelola data SSO pegawai dan hak akses sistem.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UserUploadClient />
          <UserCreateClient />
        </div>
      </div>

      <UserListClient users={users} />
    </div>
  );
}
