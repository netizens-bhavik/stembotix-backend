import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { API_BASE } from '@config';
import { Product } from '@/interfaces/product.interface';
import { getFileStream, uploadFileS3 } from '@utils/s3/s3Uploads';
import { Mail, MailPayloads } from '@/interfaces/mailPayload.interface';
import EmailService from './email.service';

class ProductService {
  public product = DB.Product;
  public user = DB.User;
  public productTag = DB.ProductTagMap;
  public productDimension = DB.ProductDimensionMap;
  public emailService = new EmailService();
  public orderitem = DB.OrderItem;
  public cartitem = DB.CartItem;
  public cart = DB.Cart;
  public order = DB.Order;
  public review = DB.Review;

  public async viewProducts(
    queryObject
  ): Promise<{ totalCount: number; records: (Product | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
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
        {
          model: this.review,
        },
      ],
    });

    return { totalCount: productsRecord.count, records: data };
  }

  public async viewProductsAdmin(
    queryObject
  ): Promise<{ totalCount: number; records: (Product | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const productsRecord = await this.product.findAndCountAll({
      where: { deletedAt: null },
    });
    const data: (Product | undefined)[] = await this.product.findAll({
      where: DB.Sequelize.and({ title: { [searchCondition]: search } }),
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
    if (user.Role.roleName === 'Student' || !user.isEmailVerified)
      throw new HttpException(401, 'Unauthorized');

    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
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
    if (user.Role.roleName === 'Student' || !user.isEmailVerified) {
      throw new HttpException(403, 'Access Forbidden');
    }
    const adminRecord = await this.user.findAll({
      where: { role: 'Admin' },
    });

    const userRecord = await this.user.findOne({
      where: {
        id: user.id,
      },
    });

    if (!userRecord)
      throw new HttpException(404, 'Requested trainer details do not exist');
    const uploadedFile = await uploadFileS3(file); // Upload of s3
    console.log('bvdhsgfh', uploadedFile);

    const filePath = `${API_BASE}/media/${file.path
      .split('/')
      .splice(-2)
      .join('/')}`;
    // var files = file;
    // var fileName = file.filename;
    // var albumPhotosKey = encodeURIComponent(file.path) + '/';

    // const uploadedFile = await uploadFileS3(file); // Upload of s3
    // console.log(uploadedFile);

    // const uploadedFile = await uploadFileS3(file); // Upload of s3

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
    if (newProduct) {
      const mailData: Mail = {
        templateData: {
          product: newProduct.title,
        },
        mailData: {
          from: user.email,
          to: adminRecord[0].email,
        },
      };
      this.emailService.sendMailPublishProduct(mailData);
    }
    return {
      id: newProduct.id,
      title: newProduct.title,
      price: newProduct.price,
      category: newProduct.category,
      description: newProduct.description,
      status: newProduct.status,
      // thumbnail: `${API_BASE}/media/${newProduct.thumbnail}`,
      thumbnail: filePath,
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
    if (user.Role.roleName === 'Student')
      throw new HttpException(403, 'Access Forbidden');
    const record = await this.user.findOne({
      include: {
        model: this.product,
        where: {
          id: productDetails.id,
        },
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
    if (user.Role.roleName === 'Student')
      throw new HttpException(401, 'Unauthorized');
    const productRecord: Product = await this.product.findOne({
      where: { id: productId },
      include: [
        {
          model: this.user,
        },
      ],
    });
    const adminRecord = await this.user.findAll({
      where: { role: 'Admin' },
    });

    if (!productRecord) throw new HttpException(403, 'Forbidden Resource');
    if (productRecord.status === 'Published') {
      const mailData: Mail = {
        templateData: {
          product: productRecord.title,
        },
        mailData: {
          from: user.email,
          to: adminRecord[0].email,
        },
      };
      this.emailService.sendMailunPublishproduct(mailData);

      throw new HttpException(
        400,
        'This course is published and can not be deleted. Please unpublished this course first with the help of Admin'
      );
    }
    const responses = await this.orderitem.findAll({
      where: {
        product_id: productId,
      },
      include: [
        {
          model: this.order,
          attributes: ['UserId'],
          include: {
            model: this.user,
            attributes: ['email'],
          },
        },
      ],
    });
    let users: string[] = [];
    await responses.map((index) => {
      users.push(index.Order.User.email as string);
    });
    const res: number = await this.product.destroy({
      where: {
        id: productId,
      },
    });
    await this.orderitem.destroy({
      where: {
        product_id: productId,
      },
    });
    await this.cartitem.destroy({
      where: {
        product_id: productId,
      },
    });
    if (res === 1) {
      const mailerData: MailPayloads = {
        templateData: {
          product: productRecord.title,
        },
        mailerData: {
          to: users,
        },
      };
      this.emailService.sendMailDeleteProduct(mailerData);
    }
    return { count: res };
  }

  public async togglePublish({ user, productId }): Promise<{ count: number }> {
    if (user.Role.roleName === 'Student')
      throw new HttpException(403, 'Forbidden Resource');
    const courseRecord = await this.product.findOne({
      where: {
        id: productId,
      },
      include: [
        {
          model: this.user,
        },
      ],
    });

    if (!courseRecord) throw new HttpException(403, 'Forbidden Resource');
    const status = courseRecord.status === 'Drafted' ? 'Published' : 'Drafted';
    const res = await courseRecord.update({ status });
    let count = res.status === 'Drafted' ? 0 : 1;
    return { count };
  }
}

export default ProductService;
