import { Router } from 'express'
import ProductController from '@/controllers/product.controller'
import validationMiddleware from '@middlewares/validation.middleware'
import { Routes } from '@interfaces/routes.interface'
import passport from 'passport'
import passportConfig from '@/config/passportConfig'
import { ProductDto } from '@/dtos/product.dto'
import uploadFiles from '@/rest/fileUpload'

class ProductRoute implements Routes {
  public path = '/product'
  public router = Router()
  public productController = new ProductController()
  public passport = passportConfig(passport)

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // view all courses with pagination (without bearer)
    this.router.get(`${this.path}`, this.productController.viewCourses)

    // add product (by admin,trainer,company )
    this.router.post(
      `${this.path}`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.single('productImg'),
        (req, res, next) => {
          req.body.price = Number(req.body.price)
          next()
        },
        validationMiddleware(ProductDto, 'body'),
      ],
      this.productController.addProduct
    )

    // view single product details
    this.router.get(
      `${this.path}/:productId`,
      this.productController.getProductById
    )

    // edit product details
    this.router.put(
      `${this.path}/:productId`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.single('productImg'),
        (req, res, next) => {
          req.body.price = Number(req.body.price)
          next()
        },
        validationMiddleware(ProductDto, 'body'),
      ],
      this.productController.updateProduct
    )
  }
}

export default ProductRoute
