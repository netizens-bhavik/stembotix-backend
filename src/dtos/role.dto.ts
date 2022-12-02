import { IsString } from "class-validator";

export class RoleDto {
  @IsString()
  public roleName: String;
}
