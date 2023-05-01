import { IsString, IsNumber, Min } from 'class-validator';

export class CouponCodeDto {
  @IsString()
  public course_id: string;
}

// export class DiscountCodeDto {
//   @IsNumber()
//   @Min(0)
//   public discount: number;
// }

export class ApplyCouponDto {
  @IsString()
  public couponCode: string;
}
