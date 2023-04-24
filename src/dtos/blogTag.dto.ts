import { IsString } from 'class-validator';

export class BlogTagDto {
  @IsString({})
  tag_name: string;
}
