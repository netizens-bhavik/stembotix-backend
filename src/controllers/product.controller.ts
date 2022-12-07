import { NextFunction, Request, Response } from 'express';
import { Product } from '@/interfaces/product.interface';
import ProductService from '@/services/product.service';

class ProductController {
  public productService = new ProductService();

  public viewCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const coursesData: (Product | undefined)[] =
        await this.productService.viewProducts({
          search,
          pageRecord,
          pageNo,
          sortBy,
          order,
        });
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };

  public listProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: (Product | undefined)[] =
        await this.productService.listProduct({ user, queryObject });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public addProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const productDetails: Request = req.body;
      const user = req.user;
      const file = req.file;

      const response: Product = await this.productService.addProduct({
        productDetails,
        file,
        user,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { productId } = req.params;
      const response: Product = await this.productService.getProductById(
        productId
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { productId } = req.params;
      const productDetails = req.body;
      console.log(req.body);
      const file = req.file;
      const user = req.user;
      productDetails['id'] = productId;
      const response = await this.productService.updateProduct({
        productDetails,
        file,
        user,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.user;
      const { productId } = req.params;
      const response: { count: number } =
        await this.productService.deleteProduct({
          user: userData,
          productId,
        });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public togglePublish = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { productId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.productService.togglePublish({
          user,
          productId,
        });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}

export default ProductController;
