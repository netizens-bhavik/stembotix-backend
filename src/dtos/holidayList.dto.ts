import { IsEnum, IsString } from 'class-validator';

export class HolidayListDTO {
  @IsString()
  public name: string;

  @IsString()
  public typeId: string;

  @IsString()
  public description: string;
}
