import { IsEnum, IsString } from 'class-validator';

export class HolidayListDTO {
  @IsString()
  public name: string;

  @IsEnum([
    'Public Holiday',
    'Private Holiday',
    'Restricted Holiday',
    'Other Holiday',
  ])
  public type: string;

  @IsString()
  public description: string;
}
