export class CreateAssignmentDto {
  userId: string;
  unitId: string;
  unitName: string;
  role: string;
  isPrimary?: boolean;
  startDate: string;
  endDate?: string;
  skNumber?: string;
  notes?: string;
}

export class UpdateAssignmentDto {
  unitId?: string;
  unitName?: string;
  role?: string;
  isPrimary?: boolean;
  startDate?: string;
  endDate?: string;
  skNumber?: string;
  notes?: string;
}
