export class CreatePeriodDto {
  unitId: string;
  unitName: string;
  unitSlug: string;
  label: string; // contoh: "2026/2027"
  isOpen?: boolean;
  quota?: number;
  fee?: number;
  bankName?: string;
  bankNumber?: string;
  bankHolder?: string;
  opensAt?: string;
  closesAt?: string;
}

export class UpdatePeriodDto {
  label?: string;
  isOpen?: boolean;
  quota?: number;
  fee?: number;
  bankName?: string;
  bankNumber?: string;
  bankHolder?: string;
  opensAt?: string;
  closesAt?: string;
}
