import { IsString, IsObject } from 'class-validator';

export class BlogDto {
  @IsString()
  public title: string;

  @IsString()
  public description: string;

  @IsObject()
  public meta: object;
}
