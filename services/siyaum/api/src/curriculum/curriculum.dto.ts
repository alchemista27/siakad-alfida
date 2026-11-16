export class CreateIwrCurriculumDto {
  iwrLevel: "iwr_1" | "iwr_2";
  topicCode: string;
  topicTitle: string;
  pageStart: number | null;
  pageEnd: number | null;
}

export class UpdateIwrCurriculumDto {
  topicCode?: string;
  topicTitle?: string;
  pageStart?: number | null;
  pageEnd?: number | null;
  isActive?: boolean;
}
