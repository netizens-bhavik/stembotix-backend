import { IsNumber } from 'class-validator';

export class QuizScoreDTO {
  @IsNumber()
  public totalQue: number;

  @IsNumber()
  public score: number;
}
