import { IsString } from 'class-validator';

export class ReplyDto {
  @IsString()
  public reply: string;

  @IsString()
  public comment_id: string;

  @IsString()
  public thumbnail: string;
}
