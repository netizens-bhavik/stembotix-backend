import { Time } from 'aws-sdk/clients/codedeploy';
import { time } from 'aws-sdk/clients/frauddetector';
import { Type } from 'class-transformer';
// import 'reflect-metadata';
import { IsString, IsNumber, Min, IsDateString, IsUUID } from 'class-validator';

export class InstituteInstructorIdDTO {
  @IsUUID()
  public id: string;
}
