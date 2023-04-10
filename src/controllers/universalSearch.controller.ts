import { NextFunction, Request, Response } from 'express';
import UniversalSearchService from '@/services/universalSearch.service';

class UniversalSearchController {
  public universalSearchService = new UniversalSearchService();

  public universalSearch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search } = req.query;
      const queryObject = { search };
      const searchData = await this.universalSearchService.universalSearch(
        queryObject
      );

      res.status(200).json(searchData);
    } catch (error) {
      next(error);
    }
  };
}
export default UniversalSearchController;
