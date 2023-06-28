import { IsString } from 'class-validator';

export class TermsConditionDto {
  @IsString()
  public title: string;

  @IsString()
  public content: string;
}
