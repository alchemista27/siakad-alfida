export class UpsertGroupDto {
  id?: string;
  name: string;
  musyrifId: string;
  description?: string;
  scheduleDay?: string;
  scheduleTime?: string;
  whatsappLink?: string;
}

export class AddMemberDto {
  groupId: string;
  userId: string;
}
