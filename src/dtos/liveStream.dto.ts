import { Time } from 'aws-sdk/clients/codedeploy';
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
  public categoryId: string;

  @IsString()
  public description: string;

  @IsDateString()
  public date: Date;

  @IsString()
  public startTime: Time;

  @IsString()
  public endTime: Time;

  @IsString()
  @IsOptional()
  public instituteId: string;
}
