import { Time } from 'aws-sdk/clients/codedeploy';
import { time } from 'aws-sdk/clients/frauddetector';
import { Type } from 'class-transformer';
// import 'reflect-metadata';
import {
  IsString,
  IsNumber,
  Min,
  IsDateString,
  IsUUID,
  IsEnum,
  IsArray,
} from 'class-validator';

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

export class leaveManagementBulkRequestDTO {
  // @IsDateString()
  // public Date: Date;
  // @IsString()
  // public leaveReason: string;
  // @IsEnum(['Sick', 'Casual', 'Earned'])
  // public leaveType: string;
  // @IsUUID()
  // public livestreamId: string[];
}

// export class leaveManagementUpdateRequestDTO {
//   @IsDateString()
//   public Date: Date;

//   @IsString()
//   public leaveReason: string;

//   @IsEnum(['Sick', 'Casual', 'Earned'])
//   public leaveType: string;

//   @IsUUID()
//   public livestreamId: string;

//   @IsEnum(['Pending', 'Approved', 'Rejected'])
//   public isApproved: string;
// }

export class leaveManagementApproveRequestDTO {
  @IsEnum(['Pending', 'Approved', 'Rejected'])
  public isApproved: string;
}
