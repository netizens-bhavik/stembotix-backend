import { IsString, IsUUID } from 'class-validator';

export class LiveStreamChatDTO {
  @IsString()
  public message: string;
}

export class LiveStreamChatGetDTO {
  @IsUUID()
  public livestreamId: string;
}
