import {Router} from 'express'
export interface QuizQue {
  status: string;
  question: string;
  option:string[];
  quiz_id:string
}