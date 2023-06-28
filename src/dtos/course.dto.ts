import { IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class AddCourseDTO {
  @IsString()
  public title: string;

  @IsNumber()
  @Min(0)
  public price: number;

  @IsString()
  public courseLevelId: string;

  @IsOptional()
  @IsString()
  public courseLanguageId?: string;

  @IsString()
  public description: string;

  @IsUUID()
  public coursetypeId: string;

  @IsString()
  @IsOptional()
  public trailer: string;

  @IsString()
  @IsOptional()
  public thumbnail: string;
}
