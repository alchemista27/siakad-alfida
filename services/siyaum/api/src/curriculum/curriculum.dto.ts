export class CreateIwrCurriculumDto {
  iwrLevel: "iwr_1" | "iwr_2";
  topicCode: string;
  topicTitle: string;
  pageStart: number;
  pageEnd: number;
}

export class UpdateIwrCurriculumDto {
  topicCode?: string;
  topicTitle?: string;
  pageStart?: number;
  pageEnd?: number;
  isActive?: boolean;
}
