import { IsString, IsEnum } from 'class-validator';

export class LeaveTypeDTO {
  @IsString()
  public leaveName: string;

  @IsString()
  public leaveDescription: string;

  @IsString()
  public leaveOptionId: string;
}
