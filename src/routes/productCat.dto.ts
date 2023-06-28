import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import validationMiddleware from '@middlewares/validation.middleware';
import ProductCatController from '@/controllers/productCat.controller';
import { ProductCatDto } from '@/dtos/productCat.dto';

class ProductCatRoute implements Routes {
  public path = '/product-cat';
  public router = Router();
  public productCatController = new ProductCatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(ProductCatDto, 'body'),
      this.productCatController.addProductCat
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.productCatController.viewAllProductCat
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.productCatController.listProductCat
    );
    this.router.put(
      `${this.path}/:catId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(ProductCatDto, 'body'),
      ],
      this.productCatController.updateProductCat
    );
    this.router.delete(
      `${this.path}/:catId`,
      passport.authenticate('jwt', { session: false }),
      this.productCatController.deleteProductCat
    );
  }
}
export default ProductCatRoute;
