import { IsString, IsObject, IsOptional } from 'class-validator';

export class PaymentGatewayDto {
  @IsString()
  public name: string;

  @IsString()
  @IsOptional()
  public logo: string;

  @IsString()
  public public_key: string;

  @IsString()
  public secret_key: string;

  @IsObject()
  @IsOptional()
  public meta?: object;
}
