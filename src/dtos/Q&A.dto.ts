import { IsString, IsNumber } from 'class-validator';

export class featQuestionDto {
  @IsString()
  public course_id: string;

  @IsString()
  public question: string;

  @IsNumber()
  public up_voted: number;
}

export class featAnswerDto {
  @IsString()
  public feat_que_id: string;

  @IsString()
  public answer: string;

  @IsNumber()
  public up_voted: number;
}
