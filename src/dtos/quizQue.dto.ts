import { IsArray, IsString,IsBoolean, IsUUID, UUIDVersion } from 'class-validator';

export class QuizQueDto {
  @IsString()
  question: string;

  @IsUUID()
  quiz_id: UUIDVersion;

  @IsArray()
  public  options: string[];
//   @IsArray()
//   options: string[];

//   @IsString({ each: true })
//   public option: string[];
// @IsBoolean()
//  public is_correct: boolean;
}
