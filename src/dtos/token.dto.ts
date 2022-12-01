import { IsString } from "class-validator";

export class CreateTokenDto {
  @IsString()
  public user_id: String;

  @IsString()
  public auth_token: String;

  @IsString()
  public refresh_token: String;
}
