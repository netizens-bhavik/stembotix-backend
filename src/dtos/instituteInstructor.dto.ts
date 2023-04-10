import {
  IsString,
  IsUUID,
  IsEmail,
  IsOptional,
  IsNumber,
  Max,
} from 'class-validator';

export class InstituteInstructorIdDTO {
  @IsString()
  public is_accepted: string;
}
export class InstituteInstructorIdDto {
  @IsUUID()
  public offerId: string;
}
export class RequestProposalDTO {
  @IsUUID()
  public instructorId: string;

  @IsString()
  public proposal: string;

  @IsOptional()
  @IsEmail()
  public email: string;
}
export class AcceptProposalDTO {
  @IsNumber()
  @Max(1)
  public count: number;
}
