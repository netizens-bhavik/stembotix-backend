import { IsString } from 'class-validator';

export class LeaveOptionDto {
  @IsString()
  public option: string;
}
