import { IsString } from 'class-validator';

export class CommentDto {
  @IsString()
  public comment: string;

  @IsString()
  public course_id: string;

}
