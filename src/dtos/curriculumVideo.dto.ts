import { IsString } from 'class-validator';

export class CurriCulumVideoDto {
  @IsString()
  public title: string;

  @IsString()
  public video_url: string;
}
