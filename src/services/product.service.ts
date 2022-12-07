import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { API_BASE } from '@config';
import { Product } from '@/interfaces/product.interface';

class ProductService {
  public product = DB.Product;
  public user = DB.User;
  public productTag = DB.ProductTagMap;
  public productDimension = DB.ProductDimensionMap;

  public async viewProducts(): Promise<(Product | undefined)[]> {
    try {
      const data: (Product | undefined)[] = await this.product.findAll({
        include: [
          {
            model: this.user,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
          },
          {
            model: this.productDimension,
          },
        ],
      });
      return data;
    } catch (error) {
      throw new HttpException(400, error);
    }
  }

  public async addProduct({ productDetails, file, user }): Promise<Product> {
    if (user.Role.roleName === 'student' || !user.isEmailVerified) {
      throw new HttpException(403, 'Access Forbidden');
    }

    const userRecord = await this.user.findOne({
      where: {
        id: user.id,
      },
    });

    if (!userRecord)
      throw new HttpException(404, 'Requested trainer details do not exist');

    const filePath = file.path.split('/').splice(-2).join('/');

    const newProduct = await this.product.create({
      ...productDetails,
      thumbnail: filePath,
    });
    const addProductDimension = await this.productDimension.create({
      product_id: newProduct.id,
      weight: productDetails.weight,
      dimension: productDetails.dimension,
    });
    newProduct.addUser(userRecord);
    return {
      id: newProduct.id,
      title: newProduct.title,
      price: newProduct.price,
      category: newProduct.category,
      description: newProduct.description,
      thumbnail: `${API_BASE}/media/${newProduct.thumbnail}`,
      sku: newProduct.sku,
      weight: addProductDimension.weight,
      dimension: addProductDimension.dimension,
    };
  }

  public async getProductById(productId: string): Promise<Product> {
    const response: Product = await this.product.findOne({
      where: {
        id: productId,
      },
      include: [
        {
          model: this.user,
          through: [],
        },
        {
          model: this.productDimension,
        },
      ],
    });
    return response;
  }

  public async updateProduct({
    productDetails,
    file,
    user,
  }): Promise<{ count: number; rows: Product[] }> {
    if (user.Role.roleName === 'student')
      throw new HttpException(403, 'Access Forbidden');
    const record = await this.user.findOne({
      include: {
        model: this.product,
        where: {
          id: productDetails.id,
        },
      },
      where: {
        id: user.id,
      },
    });
    if (!record) throw new HttpException(403, 'Forbidden Resource');

    const filePath = file?.path.split('/').splice(-2).join('/');
    if (filePath) productDetails.productImg = `${API_BASE}/media/${filePath}`;
    const updateProduct = await this.product.update(
      {
        ...productDetails,
      },
      {
        where: {
          id: productDetails.id,
        },
        returning: true,
      }
    );
    return { count: updateProduct[0], rows: updateProduct[1] };
  }
}

export default ProductService;
