import Paranoid from './paranoid.interface';

export interface featQuestion extends Paranoid {
  id: string;
  user_id: string;
  course_id: string;
  question: string;
  up_voted: number;
}

export interface featAnswerInterface extends Paranoid {
  id: string;
  feat_que_id: string;
  user_id: string;
  answer: string;
  up_voted: number;
}
