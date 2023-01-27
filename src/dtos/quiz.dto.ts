import { IsArray, IsString, IsUUID } from 'class-validator';

type QuizOption = {
  option: string;
  is_correct: boolean;
};

export class QuizDto {
  @IsString()
  public title: string;

  @IsString()
  public curriculum_id: string;
}

export class UpdateQuizDto {
  @IsString()
  public title: string;
}

export class QuizQueDTO {
  @IsString()
  public question: string;

  // @IsUUID()
  // public quiz_id: string;

  @IsArray()
  public options: QuizOption[];

  @IsString()
  public explanation: string;
}
export class QuizCorrectDTO {
  @IsString()
  public quizQueId: string;
}
