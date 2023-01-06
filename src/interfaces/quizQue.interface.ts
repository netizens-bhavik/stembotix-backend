import {Router} from 'express'
export interface QuizQue {
  status: string;
  question: string;
  option:string[];
  is_correct:boolean
  quiz_id:string
}