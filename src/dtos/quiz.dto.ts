import { IsString } from 'class-validator';

export class QuizDto {
  @IsString()
  title: string;

  @IsString()
  curriculum_id: string;
}
