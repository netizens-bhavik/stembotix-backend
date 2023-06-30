import { IsObject, IsOptional, IsEmail } from 'class-validator';

export class UserSubscribeDto {
  @IsEmail()
  public email: string;

  @IsObject()
  @IsOptional()
  public meta: object;
}
