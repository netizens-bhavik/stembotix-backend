export interface Quiz {
  title: string;
  count: number;
  rows: object;
}
export interface CompleteQuiz {
  completeQuiz: boolean;
  quiz_id: string;
  user_id: string;
  id: string;
}
