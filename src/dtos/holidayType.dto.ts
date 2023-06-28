import { IsString } from 'class-validator';

export class HolidayTypeDto {
  @IsString()
  public type: string;
}
