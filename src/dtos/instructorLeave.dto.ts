import { IsString, IsBoolean, IsUUID, IsNumber } from 'class-validator';

export class InstructorLeaveCountDTO {
  @IsNumber()
  public LeaveCount: number;

  @IsUUID()
  public LeaveTypeId: string;

  @IsUUID()
  public InstituteInstructorId: string;
}
