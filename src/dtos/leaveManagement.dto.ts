// import 'reflect-metadata';
import { IsString, IsDateString, IsUUID, IsEnum } from 'class-validator';

export class leaveManagementRequestDTO {
  @IsDateString()
  public date: Date;

  @IsString()
  public leaveReason: string;

  @IsUUID()
  public leaveTypeId: string;

  @IsUUID()
  public liveStreamId: string;
}

export class leaveManagementDateRequestDTO {
  @IsDateString()
  public date: Date;
}

export class leaveManagementApproveRequestDTO {
  @IsEnum(['Pending', 'Approved', 'Rejected'])
  public isApproved: string;
}
