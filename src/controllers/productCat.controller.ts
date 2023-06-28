import { ProductCategory } from '@/interfaces/productCate.interface';
import ProductcCatService from '@/services/productCategory.service';
import DB from '@databases';
import { NextFunction, Request, Response } from 'express';

class ProductCatController {
  public productCatService = new ProductcCatService();
  public user = DB.User;
  public coursetype = DB.CourseType;

  public addProductCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { category } = req.body;
      const response = await this.productCatService.addProductCat(
        category,
        user
      );
      res.status(200).send({
        response: response,
        message: 'Product Category Added Successfully',
      });
    } catch (err) {
      next(err);
    }
  };
  public viewAllProductCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (ProductCategory | undefined)[];
      } = await this.productCatService.viewAllProductCat(user, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public listProductCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: {
        totalCount: number;
        records: (ProductCategory | undefined)[];
      } = await this.productCatService.listProductCat(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public updateProductCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { catId } = req.params;
      const catDetail = req.body;

      const updateProductCat = await this.productCatService.updateProductCat(
        user,
        catId,
        catDetail
      );
      res.status(200).send(updateProductCat);
    } catch (error) {
      next(error);
    }
  };
  public deleteProductCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { catId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.productCatService.deleteProductCat(catId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default ProductCatController;
