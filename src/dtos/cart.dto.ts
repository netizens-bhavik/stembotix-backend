import { IsString, IsEnum } from 'class-validator';
export enum QuantityOperation {
  INC = 'INC',
  DEC = 'DEC',
}
export class AddProductDTO {
  @IsString()
  public productId: string;
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
