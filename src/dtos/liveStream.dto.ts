import { Time } from 'aws-sdk/clients/codedeploy';
import { time } from 'aws-sdk/clients/frauddetector';
import { Type } from 'class-transformer';
// import 'reflect-metadata';
import {
  IsString,
  IsNumber,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class LiveStreamDTO {
  @IsString()
  public title: string;

  @IsNumber()
  @Min(0)
  public subscriptionPrice: number;

  @IsString()
  public categories: string;

  @IsString()
  public description: string;

  @IsDateString()
  public Date: Date;

  @IsString()
  public startTime: Time;

  @IsString()
  public endTime: Time;

  @IsString()
  @IsOptional()
  public instituteId: string;
}
