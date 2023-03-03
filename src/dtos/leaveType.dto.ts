import { IsString, IsBoolean, IsEnum } from 'class-validator';

export class LeaveTypeDTO {
  @IsString()
  public LeaveName: string;

  @IsString()
  public LeaveDescription: string;

  @IsEnum(['Sick', 'Paid', 'Unpaid'])
  public Type: string;

  @IsBoolean()
  public IsEnable: boolean;
}
