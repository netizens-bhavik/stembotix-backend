import {
  IsString,
  IsEmail,
  IsDate,
  IsDateString,
  ValidateIf,
  IsAlphanumeric,
  IsEnum,
  IsBoolean,
} from 'class-validator';

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

  @IsEnum(['Instructor', 'Institute', 'Student'])
  public role: string;
}
export class CreateAdminDto {
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

  @IsEnum(['Admin'])
  public role: string;

  @IsBoolean()
  public isEmailVerified: boolean;
}
export class RegisterUserDTO {
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

  @IsEnum(['Instructor', 'Institute', 'Student', 'Admin'])
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

export class ForgotPasswordDTO {
  @IsEmail()
  public email: string;
}

export class ResetPasswordDTO {
  @IsString()
  public token: string;
  @IsString()
  public newPassword: string;
  @IsString()
  public confirmPassword: string;
}
