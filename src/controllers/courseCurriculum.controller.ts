import { NextFunction, Request, Response } from 'express';
import { CurriculumSection } from '@/interfaces/curriculumSection.interface';
import CurriculumSectionService from '@/services/courseCurriculum.service';

class CurriculumSectionController {
  public curriculumSectionService = new CurriculumSectionService();

  public addCurriculum = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const curriculumDetails = req.body;
      const user = req.user;
      const response = await this.curriculumSectionService.addSection({
        curriculumDetails,
        user,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public viewCurriculum = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const { courseId } = req.params;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (CurriculumSection | undefined)[];
      } = await this.curriculumSectionService.viewSection(
        queryObject,
        courseId
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public updateCurriculum = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { curriculumId } = req.params;
      const curriculumDetails = req.body;
      const trainer = req.user;

      const response = await this.curriculumSectionService.updateSection({
        curriculumDetails,
        trainer,
        curriculumId,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteCurriculum = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const trainerData = req.user;
      const { curriculumId } = req.params;
      const response: { count: number } =
        await this.curriculumSectionService.deleteSection({
          trainer: trainerData,
          curriculumId,
        });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default CurriculumSectionController;
