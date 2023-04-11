import DB from '@/databases';
import productData from './data/product';
import { ProductDto } from '@/dtos/product.dto';
import ProductService from '@/services/product.service';

class CreateProduct {
  public product = DB.Product;
  public user = DB.User;
  public productDimension = DB.ProductDimensionMap;

  public ProductService = new ProductService();

  public init = async () => {
    try {
      const userData = await this.user.findOne({
        where: {
          role: 'Admin',
        },
      });
      const userRecord = await this.user.findOne({
        where: {
          id: userData.id,
        },
      });
      const res = await this.product.count();
      if (res !== 0) return;

      // let productInstance: ProductDto;

      let productInstance = await this.product.create({ ...productData });

      const newDimension = await this.productDimension.create({
        product_id: productInstance.id,
        weight: productData.weight,
        dimension: productData.dimension,
      });
      productInstance.addUser(userRecord);
    } catch (error) {
      return error;
    }
  };
}
export default CreateProduct;
