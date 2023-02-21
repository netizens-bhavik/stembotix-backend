import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import CartRoute from './routes/cart.route';
import CommentRoute from './routes/comment.route';
import CompleteQuizRoute from './routes/completeQuiz.route';
import CourseRoute from './routes/courses.route';
import CurriculumSectionRoute from './routes/curriculumSection.route';
import CurriculumVideoRoute from './routes/curriculumVideo.route';
import FileUploadRoute from './routes/fileUploads.route';
import LikeDislikeRoute from './routes/likedislike.route';
import LiveStreamRoute from './routes/livestream.routes';
import OrderRoute from './routes/order.route';
import ProductRoute from './routes/product.route';
import QuizRoute from './routes/quiz.route';
import AnswerRoute from './routes/quizCorrect.route';
import QuizQueRoute from './routes/quizQue.route';
import QuizScoreRoute from './routes/quizScore.route';
import ReplyRoute from './routes/reply.route';
import ReviewRoute from './routes/review.route';
import SubscripeLiveStreamRoute from './routes/subscribeLiveStream.route';

validateEnv();

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
  new QuizRoute(),
  new QuizQueRoute(),
  new CommentRoute(),
  new ReplyRoute(),
  new LikeDislikeRoute(),
  new AnswerRoute(),
  new QuizScoreRoute(),
  new CompleteQuizRoute(),
  new ReviewRoute(),
  new LiveStreamRoute(),
  new SubscripeLiveStreamRoute(),
]);
app.listen();
