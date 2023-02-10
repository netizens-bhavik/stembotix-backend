import { Router } from 'express';
import ProductController from '@/controllers/product.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { ProductDto } from '@/dtos/product.dto';
import { uploadFiles } from '@/rest/fileUpload';

class ProductRoute implements Routes {
  public path = '/product';
  public router = Router();
  public productController = new ProductController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // view all courses with pagination (without bearer)
    this.router.get(`${this.path}`, this.productController.viewCourses);

    // view all product by admin with pagination (without bearer)
    this.router.get(
      `${this.path}/admin`,
      this.productController.viewCoursesAdmin
    );

    // view own courses
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.productController.listProduct
    );
    // add product (by admin,trainer,company )
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      [
        uploadFiles.single('productImg'),
        (req, res, next) => {
          req.body.price = Number(req.body.price);
          next();
        },
        validationMiddleware(ProductDto, 'body'),
      ],
      this.productController.addProduct
    );

    // view single product details
    this.router.get(
      `${this.path}/:productId`,
      this.productController.getProductById
    );

    // edit product details
    this.router.put(
      `${this.path}/:productId`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.single('productImg'),
        (req, res, next) => {
          req.body.price = Number(req.body.price);
          next();
        },
        validationMiddleware(ProductDto, 'body'),
      ],
      this.productController.updateProduct
    );

    // delete own course (only when unpublished)
    this.router.delete(
      `${this.path}/:productId`,
      passport.authenticate('jwt', { session: false }),
      this.productController.deleteProduct
    );

    // toggle course visibility
    this.router.put(
      `${this.path}/toggle-publish/:productId`,
      passport.authenticate('jwt', { session: false }),
      this.productController.togglePublish
    );
  }
}

export default ProductRoute;
