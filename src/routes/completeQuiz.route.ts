import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import CompleteQuizController from '@/controllers/completeQuiz.controller';

class CompleteQuizRoute implements Routes {
  public path = '/completeQuiz';
  public router = Router();
  public passport = passportConfig(passport);
  public completeQuizController = new CompleteQuizController();

<<<<<<< HEAD
            this.router.post(
                `${this.path}`,
                passport.authenticate('jwt',{session:false}),
                this.completeQuizController.createCompleteQuiz
                )
        } catch(err) {
            return(err)
        }
        }
    }
export default CompleteQuizRoute
=======
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.completeQuizController.createCompleteQuiz
    );
    this.router.get(
      `${this.path}/:quiz_id`,
      passport.authenticate('jwt', { session: false }),
      this.completeQuizController.getCompleteQuizById
    );
  }
}
export default CompleteQuizRoute;
>>>>>>> b769dfd10ecabba4204daea25206ff97090e99e3
