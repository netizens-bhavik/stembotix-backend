import { IsString, IsObject, IsArray } from 'class-validator';

export class BlogDto {
  @IsString()
  public title: string;

  @IsString()
  public description: string;

  @IsObject()
  public meta: object;

  // @IsArray()
  // public blog_tag_id: object[];

  // @IsString()
  // public blog_cat_id: string;
}
