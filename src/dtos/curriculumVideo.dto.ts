import { IsOptional, IsString } from 'class-validator';

export class CurriCulumVideoDto {
  @IsString()
  public title: string;

  @IsString()
  @IsOptional()
  public tutorial: string;
}
