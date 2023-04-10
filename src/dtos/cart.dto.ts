import {
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
export enum QuantityOperation {
  INC = 'INC',
  DEC = 'DEC',
}
export class AddProductDTO {
  @IsString()
  public productId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  public quantity?: number;
}

export class AddCourseDTO {
  @IsString()
  public courseId: string;
}

export class QuantityDTO {
  @IsString()
  public cartItemId: string;

  @IsEnum(QuantityOperation)
  public operation: QuantityOperation;
}
