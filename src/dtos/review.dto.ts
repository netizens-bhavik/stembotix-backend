import { IsNumber, IsString, Max } from 'class-validator';

export class ReviewDTO {
  @IsString()
  public review: string;

  @IsNumber()
  @Max(5)
  public rating: number;

  @IsString()
  public postId: string;
}
export class ReviewDto {
  @IsString()
  public review: string;

  @IsNumber()
  @Max(5)
  public rating: number;
}
