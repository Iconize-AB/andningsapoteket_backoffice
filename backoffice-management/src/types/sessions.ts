export interface SessionForm {
  title: string;
  description: string;
  longDescription: string;
  duration: string;
  audio: File | null;
  image: File | null;
  author: string;
  includeTheory: boolean;
  theoryTitle: string;
  theoryContent: string;
  theoryVideo: File | null;
  theoryVideoContent: string;
  theoryImage: File | null;
  categoryId: string;
  subCategoryId: string;
  activated: boolean;
  startQuestion: string;
  startQuestionLeftLabel: string;
  startQuestionRightLabel: string;
  endQuestion: string;
  endQuestionLeftLabel: string;
  endQuestionRightLabel: string;
  type: "journey" | "condition";
} 