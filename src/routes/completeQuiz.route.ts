import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import CompleteQuizController from '@/controllers/completeQuiz.controller';

class CompleteQuizRoute implements Routes{
    public path = '/completeQuiz';
    public router = Router();
    public passport = passportConfig(passport)
    public completeQuizController = new CompleteQuizController()
    
    constructor(){
        this.initializeRoutes()
    }
    private initializeRoutes(){
        try {

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
