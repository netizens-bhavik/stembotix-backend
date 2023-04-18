import { Router } from 'express';
import CartController from '@/controllers/cart.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { AddProductDTO, AddCourseDTO, QuantityDTO } from '@/dtos/cart.dto';

class CartRoute implements Routes {
  public path = '/cart';
  public router = Router();
  public cartController = new CartController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // add to product to cart
    this.router.post(
      `${this.path}/add-product`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(AddProductDTO, 'body'),
      ],
      this.cartController.addProductToCart
    );
    // add course to cart
    this.router.post(
      `${this.path}/add-course`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(AddCourseDTO, 'body'),
      ],
      this.cartController.addCourseToCart
    );
    //view user's cart Items
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.cartController.viewCart
    );
    // change quantity of item only if product
    this.router.put(`${this.path}/quantity`, [
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(QuantityDTO, 'body'),
      this.cartController.itemQuantity,
    ]);
    // empty cart
    this.router.delete(
      `${this.path}`,
      [passport.authenticate('jwt', { session: false })],
      this.cartController.emptyCart
    );
    // remove cart item
    this.router.delete(
      `${this.path}/:cartItemId`,
      [passport.authenticate('jwt', { session: false })],
      this.cartController.removeItem
    );

    this.router.get(
      `/confirmToCheckout`,
      passport.authenticate('jwt', { session: false }),
      this.cartController.confirmToCheckout
    );
  }
}
export default CartRoute;
