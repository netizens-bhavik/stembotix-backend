import { IsArray, IsString,IsBoolean } from 'class-validator';

export class QuizQueDto {
  @IsString()
  question: string;

  @IsString()
  quiz_id: string;

  @IsArray()
  public  options: string[];
//   @IsArray()
//   options: string[];

//   @IsString({ each: true })
//   public option: string[];
// @IsBoolean()
//  public is_correct: boolean;
}
