import { IsString, IsNumber, Min } from 'class-validator'

export class ProductDto {
  @IsString()
  public title: string

  @IsNumber()
  @Min(0)
  public price: number

  @IsString()
  public category: string

  @IsString()
  public sku: string

  @IsString()
  public description: string

  // @IsString()
  // public tag: string

  @IsString()
  public weight: string

  @IsString()
  public dimension: string
}
