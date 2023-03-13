import { IsString, IsBoolean, IsUUID, IsNumber } from 'class-validator';

export class InstructorLeaveCountDTO {
  @IsNumber()
  public leaveCount: number;

  @IsUUID()
  public leaveTypeId: string;

  @IsUUID()
  public instituteInstructorId: string;
}
