import { IsString } from 'class-validator';

export class CurriculumSectionDto {
  @IsString()
  public title: string;

  @IsString()
  public objective: string;
}
