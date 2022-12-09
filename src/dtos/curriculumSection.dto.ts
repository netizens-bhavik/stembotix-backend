import { IsString } from 'class-validator';

export class CurriculumSectionDto {
  @IsString()
  public title: string;

  @IsString()
  public objective: string;

  @IsString()
  public course_id: string;
}
