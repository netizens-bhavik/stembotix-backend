import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class LikeDislikeDTO {
  @IsNumber()
  public like: number;

  @IsNumber()
  public dislike: number;
}
