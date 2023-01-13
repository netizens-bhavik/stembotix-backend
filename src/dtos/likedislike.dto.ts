import { IsString, IsBoolean } from 'class-validator';

export class LikeDislikeDTO {
  @IsBoolean()
  public like: number;

  @IsBoolean()
  public dislike: number;
}
