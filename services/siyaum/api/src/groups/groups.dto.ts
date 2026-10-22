export class UpsertGroupDto {
  id?: string;
  name: string;
  level: "pra_tahsin" | "tahsin" | "tahfiz";
  unitId: string;
  description?: string;
  scheduleDay?: string;
  scheduleTime?: string;
  whatsappLink?: string;
}

export class AddMemberDto {
  groupId: string;
  userId: string;
}
