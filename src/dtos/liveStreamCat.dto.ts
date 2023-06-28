import { IsString } from 'class-validator';

export class LiveStreamCatDto {
  @IsString()
  public category: string;
}
