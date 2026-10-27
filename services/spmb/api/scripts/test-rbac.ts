import { SpmbRolesGuard, SPMB_ROLES_KEY } from "../src/common/guards/spmb-roles.guard";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

// Mock ExecutionContext helper
function createMockContext(user: any, requiredRoles?: string[]): ExecutionContext {
  const reflector = new Reflector();
  if (requiredRoles) {
    jestMetadataStore.set(SPMB_ROLES_KEY, requiredRoles);
  } else {
    jestMetadataStore.delete(SPMB_ROLES_KEY);
  }

  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

const jestMetadataStore = new Map<string, any>();

class MockReflector {
  getAllAndOverride(key: string) {
    return jestMetadataStore.get(key);
  }
}

async function runTests() {
  console.log("=== Memulai Uji Otomatis RBAC SPMB (SpmbRolesGuard) ===\n");

  const guard = new SpmbRolesGuard(new MockReflector() as any);
  let passed = 0;
  let failed = 0;

  // Test 1: Ortu dilarang akses endpoint admin_unit
  try {
    const ctx = createMockContext(
      {
        id: "user-ortu-1",
        roles: [{ app: "spmb", role: "orang_tua" }],
      },
      ["admin_unit"]
    );
    guard.canActivate(ctx);
    console.error("[FAIL] Test 1: Harusnya melempar ForbiddenException");
    failed++;
  } catch (err: any) {
    if (err instanceof ForbiddenException && err.message.includes("Akses ditolak")) {
      console.log("[PASS] Test 1: Ortu ditolak mengakses endpoint admin_unit (403 Forbidden)");
      passed++;
    } else {
      console.error("[FAIL] Test 1: Melempar error tak terduga", err);
      failed++;
    }
  }

  // Test 2: Admin Unit diizinkan akses endpoint admin_unit
  try {
    const ctx = createMockContext(
      {
        id: "user-admin-1",
        roles: [{ app: "spmb", role: "admin_unit" }],
      },
      ["admin_unit"]
    );
    const result = guard.canActivate(ctx);
    if (result === true) {
      console.log("[PASS] Test 2: Admin unit diizinkan mengakses endpoint admin_unit");
      passed++;
    } else {
      console.error("[FAIL] Test 2: Guard tidak mengembalikan true");
      failed++;
    }
  } catch (err: any) {
    console.error("[FAIL] Test 2: Error saat mengecek admin unit", err);
    failed++;
  }

  // Test 3: Observer diizinkan akses submit-result
  try {
    const ctx = createMockContext(
      {
        id: "user-observer-1",
        roles: [{ app: "spmb", role: "observer" }],
      },
      ["observer", "admin_unit"]
    );
    const result = guard.canActivate(ctx);
    if (result === true) {
      console.log("[PASS] Test 3: Observer diizinkan mengakses endpoint penilaian observasi");
      passed++;
    } else {
      console.error("[FAIL] Test 3: Guard tidak mengembalikan true");
      failed++;
    }
  } catch (err: any) {
    console.error("[FAIL] Test 3: Error saat mengecek observer", err);
    failed++;
  }

  // Test 4: Observer dilarang akses kelulusan murid (admin_unit only)
  try {
    const ctx = createMockContext(
      {
        id: "user-observer-2",
        roles: [{ app: "spmb", role: "observer" }],
      },
      ["admin_unit"]
    );
    guard.canActivate(ctx);
    console.error("[FAIL] Test 4: Harusnya melempar ForbiddenException");
    failed++;
  } catch (err: any) {
    if (err instanceof ForbiddenException) {
      console.log("[PASS] Test 4: Observer ditolak mengakses penetapan kelulusan (admin_unit only)");
      passed++;
    } else {
      console.error("[FAIL] Test 4: Melempar error tak terduga", err);
      failed++;
    }
  }

  // Test 5: Super Admin memiliki hak bypass penuh
  try {
    const ctx = createMockContext(
      {
        id: "user-superadmin-1",
        roles: [{ app: "*", role: "super_admin" }],
      },
      ["admin_unit"]
    );
    const result = guard.canActivate(ctx);
    if (result === true) {
      console.log("[PASS] Test 5: Super Admin berhasil bypass hak akses penuh (wildcard)");
      passed++;
    } else {
      console.error("[FAIL] Test 5: Super Admin gagal bypass");
      failed++;
    }
  } catch (err: any) {
    console.error("[FAIL] Test 5: Error pada super admin", err);
    failed++;
  }

  // Test 6: Pegawai dari modul lain (simpeg) ditolak pada endpoint spmb
  try {
    const ctx = createMockContext(
      {
        id: "user-simpeg-1",
        roles: [{ app: "simpeg", role: "pegawai" }],
      },
      ["orang_tua"]
    );
    guard.canActivate(ctx);
    console.error("[FAIL] Test 6: Harusnya melempar ForbiddenException");
    failed++;
  } catch (err: any) {
    if (err instanceof ForbiddenException) {
      console.log("[PASS] Test 6: Pegawai dari modul luar (simpeg) ditolak dari endpoint SPMB");
      passed++;
    } else {
      console.error("[FAIL] Test 6: Melempar error tak terduga", err);
      failed++;
    }
  }

  // Test 7: Endpoint publik / tanpa role diizinkan untuk semua pengguna login
  try {
    const ctx = createMockContext(
      {
        id: "user-any-1",
        roles: [{ app: "spmb", role: "orang_tua" }],
      },
      undefined
    );
    const result = guard.canActivate(ctx);
    if (result === true) {
      console.log("[PASS] Test 7: Endpoint tanpa anotasi peran diizinkan untuk seluruh user terautentikasi");
      passed++;
    } else {
      console.error("[FAIL] Test 7: Gagal mengembalikan true");
      failed++;
    }
  } catch (err: any) {
    console.error("[FAIL] Test 7: Error pada endpoint publik", err);
    failed++;
  }

  console.log(`\n=== Hasil Akhir Uji RBAC SPMB: ${passed} LULUS, ${failed} GAGAL ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
