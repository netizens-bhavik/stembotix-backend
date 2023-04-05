import { IsString } from 'class-validator';

export class CommentDto {
  @IsString({})
  comment: string;

  @IsString({})
  title: string;
}
