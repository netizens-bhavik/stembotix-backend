import { IsString, IsUUID, IsEmail } from 'class-validator';

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

  @IsEmail()
  public email: string;
}
