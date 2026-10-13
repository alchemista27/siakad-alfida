export class CreateLeaveDto {
  type: "cuti" | "sakit" | "izin";
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl?: string;
}

export class ProcessLeaveDto {
  notes?: string;
}
