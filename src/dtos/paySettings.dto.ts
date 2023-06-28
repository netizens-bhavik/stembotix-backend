import { IsObject } from 'class-validator';

export class PaymentSettingsDto {
  @IsObject()
  public meta: object;
}
