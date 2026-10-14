import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SimakinRolesGuard, SIMAKIN_ROLES_KEY } from '../src/common/guards/simakin-roles.guard';

function mockExecutionContext(user: any, requiredRoles?: string[]): { context: ExecutionContext; reflector: Reflector } {
  const reflector = new Reflector();
  jestMockReflector(reflector, requiredRoles);

  const context = {
    getHandler: () => () => {},
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;

  return { context, reflector };
}

function jestMockReflector(reflector: Reflector, requiredRoles?: string[]) {
  reflector.getAllAndOverride = ((key: string) => {
    if (key === SIMAKIN_ROLES_KEY) {
      return requiredRoles;
    }
    return undefined;
  }) as any;
}

async function runTests() {
  console.log('=== Memulai Uji Otomatis RBAC SimakinRolesGuard ===\n');
  let passCount = 0;
  let failCount = 0;

  const runTest = (name: string, fn: () => void) => {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passCount++;
    } catch (e: any) {
      console.error(`[FAIL] ${name}: ${e.message}`);
      failCount++;
    }
  };

  // Test 1: User tanpa peran sama sekali harus ditolak (403)
  runTest('Tolak pengguna tanpa peran pada endpoint berproteksi', () => {
    const { context, reflector } = mockExecutionContext({ id: '1', email: 'test@alfida.or.id', roles: [] }, ['admin_bidang']);
    const guard = new SimakinRolesGuard(reflector);
    try {
      guard.canActivate(context);
      throw new Error('Harusnya melempar ForbiddenException');
    } catch (err: any) {
      if (!(err instanceof ForbiddenException)) throw err;
    }
  });

  // Test 2: User dengan peran orang_tua (bukan peran SIMAKIN) harus ditolak (403)
  runTest('Tolak peran orang_tua saat mengakses fitur admin_bidang', () => {
    const { context, reflector } = mockExecutionContext(
      {
        id: '1',
        email: 'ortu@gmail.com',
        roles: [{ app: 'spmb', role: 'orang_tua' }],
      },
      ['admin_bidang']
    );
    const guard = new SimakinRolesGuard(reflector);
    try {
      guard.canActivate(context);
      throw new Error('Harusnya melempar ForbiddenException');
    } catch (err: any) {
      if (!(err instanceof ForbiddenException)) throw err;
    }
  });

  // Test 3: User dengan peran admin_biro mengakses fitur khusus admin_bidang (verifikasi baseline) harus ditolak (403)
  runTest('Tolak admin_biro saat mengakses endpoint khusus admin_bidang', () => {
    const { context, reflector } = mockExecutionContext(
      {
        id: '2',
        email: 'biro@alfida.or.id',
        roles: [{ app: 'simakin', role: 'admin_biro' }],
      },
      ['admin_bidang']
    );
    const guard = new SimakinRolesGuard(reflector);
    try {
      guard.canActivate(context);
      throw new Error('Harusnya melempar ForbiddenException');
    } catch (err: any) {
      if (!(err instanceof ForbiddenException)) throw err;
    }
  });

  // Test 4: User dengan peran admin_bidang mengakses fitur admin_bidang harus diizinkan (true)
  runTest('Izinkan admin_bidang mengakses endpoint admin_bidang', () => {
    const { context, reflector } = mockExecutionContext(
      {
        id: '3',
        email: 'bidang@alfida.or.id',
        roles: [{ app: 'simakin', role: 'admin_bidang' }],
      },
      ['admin_bidang', 'admin_biro']
    );
    const guard = new SimakinRolesGuard(reflector);
    const result = guard.canActivate(context);
    if (result !== true) throw new Error('Harusnya bernilai true');
  });

  // Test 5: User dengan peran super_admin wildcard harus diizinkan ke seluruh endpoint (true)
  runTest('Izinkan super_admin (wildcard) mengakses endpoint admin_bidang', () => {
    const { context, reflector } = mockExecutionContext(
      {
        id: '4',
        email: 'admin@alfida.or.id',
        roles: [{ app: '*', role: 'super_admin' }],
      },
      ['admin_bidang']
    );
    const guard = new SimakinRolesGuard(reflector);
    const result = guard.canActivate(context);
    if (result !== true) throw new Error('Harusnya bernilai true');
  });

  // Test 6: Endpoint tanpa anotasi peran (@SimakinRoles) harus mengizinkan pengguna terautentikasi
  runTest('Izinkan pengguna terautentikasi jika endpoint publik tanpa batasan role', () => {
    const { context, reflector } = mockExecutionContext(
      {
        id: '5',
        email: 'user@alfida.or.id',
        roles: [{ app: 'simpeg', role: 'pegawai' }],
      },
      undefined
    );
    const guard = new SimakinRolesGuard(reflector);
    const result = guard.canActivate(context);
    if (result !== true) throw new Error('Harusnya bernilai true');
  });

  console.log(`\n=== Hasil Pengujian: ${passCount} LULUS, ${failCount} GAGAL ===`);
  if (failCount > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
