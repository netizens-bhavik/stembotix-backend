import { IsNumber, IsString, Min } from 'class-validator';

export class AddOrderDto {
  @IsNumber()
  @Min(0)
  public subscriptionPrice: number;
}

export class VerifyOrderDto {
  @IsString()
  public razorpayOrderId: string;
  @IsString()
  public paymentId: string;
  @IsString()
  public razorpaySignature: string;
}
