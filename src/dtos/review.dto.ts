import { IsNumber, IsString, Max } from 'class-validator';

export class ReviewDTO {
  @IsString()
  review: string;

  @IsNumber()
  @Max(5)
  rating: number;

  @IsString()
  postId: string;

  // @IsString()
  // type: string;
}
export class ReviewDto{
  @IsString()
  review: string;

  @IsNumber()
  @Max(5)
  rating: number;
}