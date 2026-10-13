export class UpsertEmployeeProfileDto {
  userId: string;
  nip?: string;
  position?: string;
  employeeType?: string; // tetap, kontrak, honorer
  joinDate?: string;
  notes?: string;
}

export class SyncUserDto {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  leaveQuota?: number;
  isActive?: boolean;
}
