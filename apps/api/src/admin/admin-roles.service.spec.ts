import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@sim/database';

describe('AdminService Role Mapping & Management', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should correctly map role strings including biro, nondik, bidang, and yayasan', () => {
    const mapRole = (service as any).mapRole.bind(service);

    expect(mapRole('super_admin')).toBe(UserRole.super_admin);
    expect(mapRole('admin_biro')).toBe(UserRole.admin_biro);
    expect(mapRole('admin_unit_nondik')).toBe(UserRole.admin_unit_nondik);
    expect(mapRole('non_pendidikan')).toBe(UserRole.admin_unit_nondik);
    expect(mapRole('admin_bidang')).toBe(UserRole.admin_bidang);
    expect(mapRole('pengawas_yayasan')).toBe(UserRole.pengawas_yayasan);
    expect(mapRole('murobbi')).toBe(UserRole.murobbi);
    expect(mapRole('supervisor_kesiswaan')).toBe(UserRole.supervisor_kesiswaan);
    expect(mapRole('tim_ppdb')).toBe(UserRole.tim_ppdb);
    expect(mapRole('guru')).toBe(UserRole.guru);
    expect(mapRole('karyawan')).toBe(UserRole.karyawan);
    expect(mapRole('observer')).toBe(UserRole.observer);
    expect(mapRole('admin_unit')).toBe(UserRole.admin_unit);
    expect(mapRole('orang_tua')).toBe(UserRole.orang_tua);
  });
});
