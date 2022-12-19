import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { API_BASE } from '@config';
import { Product } from '@/interfaces/product.interface';

class ProductService {
  public product = DB.Product;
  public user = DB.User;
  public productTag = DB.ProductTagMap;
  public productDimension = DB.ProductDimensionMap;

  public async viewProducts(
    queryObject
  ): Promise<{ totalCount: number; records: (Product | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const productsRecord = await this.product.findAndCountAll({
      where: { status: 'Published' },
    });
    const data: (Product | undefined)[] = await this.product.findAll({
      where: DB.Sequelize.and(
        { status: 'Published' },
        {
          title: {
            [searchCondition]: search,
          },
        }
      ),
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
      include: [
        {
          model: this.user,
          attributes: [
            'id',
            'fullName',
            'firstName',
            'lastName',
            'email',
            'isEmailVerified',
            'date_of_birth',
            'role',
            'role_id',
          ],
        },
        {
          model: this.productDimension,
        },
      ],
    });
    return { totalCount: productsRecord.count, records: data };
  }

  public async listProduct({
    user,
    queryObject,
  }): Promise<{ totalCount: number; records: (Product | undefined)[] }> {
    if (user.Role.roleName === 'student' || !user.isEmailVerified)
      throw new HttpException(401, 'Unauthorized');

    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;

    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const creatorRecord = await this.user.findOne({
      where: { id: user.id },
    });
    if (!creatorRecord) throw new HttpException(404, 'Invalid Request');
    const { count } = await this.product.findAndCountAll({
      include: [
        {
          model: this.user,
          where: {
            id: creatorRecord.id,
          },
        },
      ],
    });
    const courses = await this.product.findAll({
      where: DB.Sequelize.or(
        { title: { [searchCondition]: search } },
        { sku: { [searchCondition]: search } }
      ),
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
      include: [
        {
          model: this.user,
          through: [],
          where: {
            id: creatorRecord.id,
          },
        },
        {
          model: this.productDimension,
        },
      ],
    });
    return { totalCount: count, records: courses };
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

    const filePath = `${API_BASE}/media/${file.path
      .split('/')
      .splice(-2)
      .join('/')}`;

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
      status: newProduct.status,
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
    if (file) {
      const filePath = `${API_BASE}/media/${file.path
        .split('/')
        .splice(-2)
        .join('/')}`;
      productDetails.thumbnail = filePath;
    }
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

  public async deleteProduct({ user, productId }): Promise<{ count: number }> {
    if (user.Role.roleName === 'student')
      throw new HttpException(401, 'Unauthorized');
    const courseRecord: Product = await this.product.findOne({
      where: { id: productId },
      include: [
        {
          model: this.user,
          where: {
            id: user.id,
          },
        },
      ],
    });
    if (!courseRecord) throw new HttpException(403, 'Forbidden Resource');
    if (courseRecord.status === 'Published')
      throw new HttpException(
        400,
        'This product is published and can not be deleted. First unpublish this product and then delete it.'
      );
    const res: number = await this.product.destroy({
      where: {
        id: productId,
      },
    });

    return { count: res };
  }

  public async togglePublish({ user, productId }): Promise<{ count: number }> {
    if (user.Role.roleName === 'student')
      throw new HttpException(403, 'Forbidden Resource');
    const courseRecord = await this.product.findOne({
      where: {
        id: productId,
      },
      include: [
        {
          model: this.user,
          through: [],
          where: { id: user.id },
        },
      ],
    });
    if (!courseRecord) throw new HttpException(403, 'Forbidden Resource');
    const status = courseRecord.status === 'Drafted' ? 'Published' : 'Drafted';
    await courseRecord.update({ status });
    return { count: 1 };
  }
}

export default ProductService;
