import { IsString, IsNumber } from 'class-validator';

export class CouponCodeDto {
  @IsString()
  public course_id: string;
}

export class DiscountCodeDto {
  @IsNumber()
  public discount: number;
}

export class ApplyCouponDto {
  @IsString()
  public couponCode: string;
}
