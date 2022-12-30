import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import DB from '@/databases';
import productData from "./data/product"
import { ProductDto } from '@/dtos/product.dto';
import ProductService from '@/services/product.service';

class CreateProduct {
  public product = DB.Product;
  public ProductService = new ProductService();

  public init = async () => {
    try {
      const res = await this.product.count();
      if (res !== 0) return;

      let productInstance: ProductDto;


      productInstance = await this.product.create(productData);
    } catch (error) {
      console.log(error);
    }
  };
}
export default CreateProduct;