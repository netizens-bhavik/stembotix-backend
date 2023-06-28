import { IsString } from 'class-validator';

export class ProductCatDto {
  @IsString()
  public category: string;
}
