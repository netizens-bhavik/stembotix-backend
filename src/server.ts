import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import CartRoute from './routes/cart.route';
import CourseRoute from './routes/courses.route';
import CurriculumSectionRoute from './routes/curriculumSection.route';
import CurriculumVideoRoute from './routes/curriculumVideo.route';
import FileUploadRoute from './routes/fileUploads.route';
import OrderRoute from './routes/order.route';
import ProductRoute from './routes/product.route';

validateEnv();
try{
  const app = new App([
    new IndexRoute(),
    new UsersRoute(),
    new AuthRoute(),
    new FileUploadRoute(),
    new CourseRoute(),
    new CartRoute(),
    new ProductRoute(),
    new CurriculumSectionRoute(),
    new CurriculumVideoRoute(),
    new OrderRoute(),
  ]);
  app.listen();
  
}catch(error){
  console.log("first,error",error)
}
