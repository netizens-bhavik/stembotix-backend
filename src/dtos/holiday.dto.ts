import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class HolidayDTO {
  @IsDateString()
  public date: Date;

  @IsUUID()
  public holidayListId: string;

}
