import { IsString } from 'class-validator';

export class CourseLanguageDto {
  @IsString()
  public language: string;
}
