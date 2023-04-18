import { NextFunction, Request, Response } from 'express';
import { AddProductDTO, AddCourseDTO, QuantityDTO } from '@/dtos/cart.dto';
import CartService from '@/services/cart.service';
import { Cart, CartItem } from '@interfaces/cart.interface';

class CartController {
  public cartService = new CartService();

  public addProductToCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // @ts-ignore
      const { id: userId } = req.user;
      const { productId, quantity }: AddProductDTO = req.body;
      const response: { message: string; data?: CartItem | {} } =
        await this.cartService.addProductToCart(userId, productId, quantity);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public addCourseToCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // @ts-ignore
      const { id: userId } = req.user;
      const { courseId }: AddCourseDTO = req.body;
      const response: { message: string; data?: CartItem | {} } =
        await this.cartService.addCourseToCart(userId, courseId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public itemQuantity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // @ts-ignore
      const { id: userId } = req.user;
      const { cartItemId, operation }: QuantityDTO = req.body;
      const response = await this.cartService.itemHandler(
        userId,
        cartItemId,
        operation
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public viewCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const { id: userId } = req.user;
      const response: Cart = await this.cartService.viewCart(userId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public emptyCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // @ts-ignore
      const { id } = req.user;
      const response = await this.cartService.emptyCart(id);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public removeItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // @ts-ignore
      const { id: userId } = req.user;
      const { cartItemId } = req.params;
      const response = await this.cartService.removeItem(userId, cartItemId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public confirmToCheckout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // @ts-ignore
      const user = req.user;
      const response = await this.cartService.confirmToCheckout(user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default CartController;
