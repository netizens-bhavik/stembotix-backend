import { IsString } from 'class-validator';

export class BlogCategoryDto {
  @IsString({})
  cat_name: string;
}
