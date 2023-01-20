import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { Cart, CartItem } from '@/interfaces/cart.interface';
import { QuantityOperation } from '@dtos/cart.dto';
enum ItemTypes {
  Product = 'Product',
  Course = 'Course',
}
class CartService {
  public user = DB.User;
  public course = DB.Course;
  public product = DB.Product;
  public cart = DB.Cart;
  public cartItem = DB.CartItem;
  public itemType = {};
  public async addProductToCart(
    userId: string,
    productId: string,
    quantity: number = 1
  ) {
    const cartRecord = await this.cart.findOrCreate({
      where: { userId: userId },
    });
    const cartID = cartRecord[0].id;

    const productData = await this.product.findOne({
      where: { id: productId },
    });
    if (!productData) throw new HttpException(404, 'Product not found');

    const cartItem = await this.cartItem.findOrCreate({
      where: {
        CartId: cartID,
        item_type: ItemTypes.Product,
        product_id: productId,
        quantity,
      },
    });

    const res: { message: string; data: CartItem | {} } = {
      message: '',
      data: {},
    };
    if (!cartItem[1]) throw new HttpException(400, 'Invalid operation');
    res.data = cartItem[0];
    res.message = `${ItemTypes.Product} added to cart successfully.`;
    return res;
  }
  public async addCourseToCart(userId: string, courseId: string) {
    const cartRecord = await this.cart.findOrCreate({
      where: { userId: userId },
    });
    const cartID = cartRecord[0].id;

    const courseData = await this.course.findOne({
      where: DB.Sequelize.and({ id: courseId }, { status: 'Published' }),
    });
    if (!courseData) {
      throw new HttpException(404, 'Course not found');
    }

    const cartItem = await this.cartItem.findOrCreate({
      where: {
        CartId: cartID,
        item_type: ItemTypes.Course,
        course_id: courseId,
      },
    });

    const res: { message: string; data: CartItem | {} } = {
      message: '',
      data: {},
    };
    if (!cartItem[1]) throw new HttpException(400, 'Invalid operation');
    res.data = cartItem[0];
    res.message = `${ItemTypes.Product} added to cart successfully.`;
    return res;
  }
  public async itemHandler(
    userId: string,
    cartItemId: string,
    operation: string
  ) {
    const itemRecord = await this.cartItem.findOne({
      where: DB.Sequelize.and({ id: cartItemId }),
      include: {
        model: this.cart,
        where: { user_id: userId },
      },
    });
    if (!itemRecord) throw new HttpException(404, 'Record not found');

    if (itemRecord.item_type === ItemTypes.Course)
      throw new HttpException(400, 'Invalid Operation');

    let message = '';
    if (operation === QuantityOperation.INC) {
      message = 'Upper limit reached';
      if (itemRecord.quantity < 10) {
        await itemRecord.update({ quantity: itemRecord.quantity + 1 });
        message = 'Cart Item quantity increased successfully';
      }
    } else {
      if (itemRecord.quantity === 1) {
        await itemRecord.destroy();
        message = 'Cart Item removed successfully';
      } else {
        await itemRecord.update({ quantity: itemRecord.quantity - 1 });
        message = 'Cart Item quantity decreased successfully';
      }
    }
    return { message };
  }
  public async viewCart(userId, queryObject) {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const cart = await this.cart.findOne({
      where: { user_id: userId },
      include: {
        model: this.cartItem,
        include: [
          {
            model: this.course,
          },
          {
            model: this.product,
          },
        ],
        limit: pageSize,
        offset: pageNo,
        order: [[`${sortBy}`, `${order}`]],
      },
      order: [[{ model: this.cartItem, as: 'CartItems' }, 'created_at', 'ASC']],
    });
    if (!cart) return { message: 'Empty Cart' };
    return cart;
  }
  public async emptyCart(userId: string) {
    const cartRecord = await this.cart.findOne({
      where: { user_id: userId },
    });
    if (!cartRecord) throw new HttpException(404, 'Record not found');
    await this.cartItem.destroy({ where: { cart_id: cartRecord.id } });
    await cartRecord.destroy();
    return { message: 'Cart cleared successfully' };
  }
  public async removeItem(userId: string, cartItemId: string) {
    const cartItemRecord = await this.cartItem.findOne({
      where: { id: cartItemId },
      include: {
        model: this.cart,
        where: {
          user_id: userId,
        },
      },
    });
    if (!cartItemRecord) throw new HttpException(404, 'Record not found');
    await cartItemRecord.destroy();
    return { message: 'Item removed successfully' };
  }
}
export default CartService;
