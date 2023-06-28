import { IsString } from 'class-validator';

export class CourseLevelDto {
  @IsString()
  public level: string;
}
