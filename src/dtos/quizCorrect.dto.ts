import { IsString } from 'class-validator';
export class QuizCorrectDto {
  @IsString()
  public option_id: string;

  @IsString()
  public quiz_que_id: string;
}
