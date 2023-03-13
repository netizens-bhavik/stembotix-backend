import { IsString, IsBoolean, IsEnum } from 'class-validator';

export class LeaveTypeDTO {
  @IsString()
  public leaveName: string;

  @IsString()
  public leaveDescription: string;

  @IsEnum(['Sick', 'Paid', 'Unpaid'])
  public type: string;
}
