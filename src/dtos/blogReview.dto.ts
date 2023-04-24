import { IsString, IsEmail } from 'class-validator';

export class BlogReviewDto {
  @IsString({})
  sender_name: string;

  @IsEmail({})
  email: string;

  @IsString({})
  comment: string;
}
