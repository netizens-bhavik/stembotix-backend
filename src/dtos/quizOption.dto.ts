import { IsString } from 'class-validator';

export class QuizOptionDto {
  @IsString()
  option_first: string;

  @IsString()
  option_sec: string;

  @IsString()
  option_third: string;

  @IsString()
  option_fourth: string;

  @IsString()
  quizQue_id: string;
}
