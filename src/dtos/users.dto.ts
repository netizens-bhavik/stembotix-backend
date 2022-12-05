import {
  IsString,
  IsEmail,
  IsDate,
  IsDateString,
  ValidateIf,
} from "class-validator";

export class RegisterUserDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

  @IsDateString()
  public date_of_birth: Date;

  @IsString()
  public role: string;
}

export class LoginUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  public cookie?: string;
}
