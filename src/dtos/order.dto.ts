import { IsNumber, IsString, Min } from 'class-validator';

export class AddOrderDTO {
  @IsNumber()
  @Min(0)
  public amount: number;
}
export class VerifyOrderDTO {
  @IsString()
  public orderId: string;
  @IsString()
  public razorpayOrderId: string;
  @IsString()
  public paymentId: string;
  @IsString()
  public razorpaySignature: string;
  @IsString({ each: true })
  public cartItems: string[];
}
