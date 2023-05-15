import { IsString, IsEmail } from 'class-validator';

export class BlogReviewDto {
  @IsString({})
  comment: string;
}
