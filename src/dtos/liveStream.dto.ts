import { Type } from 'class-transformer';
// import 'reflect-metadata';
import {
  IsString,
  IsNumber,
  Min,
  IsDateString,
  IsBoolean,
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
  public startDate: Date;

  @IsDateString()
  public endDate: Date;

  @IsString()
  public link: string;

  @IsString()
  public is_active: string;

  @IsString()
  public is_completed: string;
}
