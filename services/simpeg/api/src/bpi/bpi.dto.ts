export class UpsertLiqoGroupDto {
  id?: string;
  name: string;
  murobbiId: string;
  description?: string;
  scheduleDay?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
  scheduleTime?: string;
  scheduleLocation?: string;
  whatsappLink?: string;
}

export class AddLiqoMemberDto {
  groupId: string;
  userId: string;
}

export class CreateLiqoMeetingDto {
  date: string;
  materialTitle: string;
  summary?: string;
}

export class SaveLiqoAttendanceDto {
  meetingId: string;
  attendances: Array<{
    userId: string;
    status: "present" | "sick" | "permitted" | "absent";
    notes?: string;
  }>;
}

export class SaveMutabaahRecordDto {
  date: string;
  sholatJamaah?: number;
  sholatRawatib?: number;
  sholatDhuha?: boolean;
  sholatTahajud?: boolean;
  tilawahPages?: number;
  puasaSunnah?: boolean;
  infaq?: boolean;
}
