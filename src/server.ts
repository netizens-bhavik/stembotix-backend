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
import LiveStreamRoute from './routes/livestream.route';
import OrderRoute from './routes/order.route';
import ProductRoute from './routes/product.route';
import QuizRoute from './routes/quiz.route';
import AnswerRoute from './routes/quizCorrect.route';
import QuizQueRoute from './routes/quizQue.route';
import QuizScoreRoute from './routes/quizScore.route';
import ReplyRoute from './routes/reply.route';
import ReviewRoute from './routes/review.route';
import SubscripeLiveStreamRoute from './routes/subscribeLiveStream.route';
import LiveStreamChatRoute from './routes/liveStreamChat.route';
import InstituteInstroctorRoute from './routes/instituteinstructor.route';
import LeaveManagementRoute from './routes/leaveManagement.route';
import UniversalSearchRoute from './routes/universalSearch.route';
import LeaveTypeRoute from './routes/leaveType.route';
import InstructorLeaveRoute from './routes/instructorHasLeave.route';
import CourseTypeRoute from './routes/courseType.route';
import HolidayListRoute from './routes/holidayList.route';
import HolidayRoute from './routes/holiday.route';
import AllOrderRoute from './routes/allOrder.route';
import CourseProductStatsRoute from './routes/courseproductStats.route';
import CouponCodeRoute from './routes/couponCode.route';
import AllCourseForInstituteRoute from './routes/instructorinstituteCourse.route';
import ContactRoute from './routes/contact.route';
import BlogTagRoute from './routes/blogTag.route';

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
  new LiveStreamChatRoute(),
  new InstituteInstroctorRoute(),
  new LeaveManagementRoute(),
  new UniversalSearchRoute(),
  new LeaveTypeRoute(),
  new InstructorLeaveRoute(),
  new CourseTypeRoute(),
  new HolidayListRoute(),
  new HolidayRoute(),
  new AllOrderRoute(),
  new CourseProductStatsRoute(),
  new CouponCodeRoute(),
  new AllCourseForInstituteRoute(),
  new ContactRoute(),
  new BlogTagRoute(),
]);
app.listen();
