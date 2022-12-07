import { IsString, IsNumber, IsOptional, Min } from "class-validator";

export class AddCourseDTO {
  @IsString()
  public title: string;

  @IsNumber()
  @Min(0)
  public price: number;

  @IsString()
  public level: string;

  @IsOptional()
  @IsString()
  public language?: string;

  @IsString()
  public description: string;
}
