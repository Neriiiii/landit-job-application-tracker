export interface InterviewQuestionCategory {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
}

export interface InterviewQuestion {
  id: string;
  categoryId: string;
  question: string;
  sortOrder: number;
}
