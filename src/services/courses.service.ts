import DB from "@databases";
import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { Course } from "@/interfaces/course.interface";
import { API_BASE } from "@config";

class CourseService {
  public course = DB.Course;
  public trainer = DB.Trainer;
  public user = DB.User;
  public coursesTrainers = DB.CoursesTrainers;

  public async viewCourses(): Promise<(Course | undefined)[]> {
    try {
      const data: (Course | undefined)[] = await this.course.findAll({
        include: [
          {
            model: this.trainer,
            include: [
              {
                model: this.user,
              },
            ],
          },
        ],
      });
      return data;
    } catch (error) {
      throw new HttpException(400, error);
    }
  }
  public async addCourse({ courseDetails, file, trainer }): Promise<Course> {
    if (trainer.Role.roleName !== "trainer" || !trainer.isEmailVerified) {
      throw new HttpException(403, "Access Forbidden");
    }

    const trainerRecord = await this.trainer.findOne({
      where: {
        user_id: trainer.id,
      },
    });

    if (!trainerRecord)
      throw new HttpException(404, "Requested trainer details do not exist");

    const filePath = file.path.split("/").splice(-2).join("/");

    const newCourse = await this.course.create({
      ...courseDetails,
      thumbnail: filePath,
    });
    newCourse.addTrainer(trainerRecord);
    return {
      id: newCourse.id,
      status: newCourse.status,
      title: newCourse.title,
      level: newCourse.level,
      price: newCourse.price,
      language: newCourse.language,
      description: newCourse.description,
      thumbnail: `${API_BASE}/media/${newCourse.thumbnail}`,
      // @ts-ignore
      updatedAt: newCourse.updateAt,
      createdAt: newCourse.createdAt,
      deletedAt: newCourse.deletedAt,
    };
  }
  public async getCourseById(courseId: string): Promise<Course> {
    const response: Course = await this.course.findOne({
      where: {
        id: courseId,
      },
      include: [
        {
          model: this.trainer,
          through: [],
          include: [
            {
              model: this.user,
            },
          ],
        },
      ],
    });
    return response;
  }
  public async updateCourse({
    courseDetails,
    file,
    trainer,
  }): Promise<{ count: number; rows: Course[] }> {
    if (trainer.Role.roleName !== "trainer" || !trainer.isEmailVerified)
      throw new HttpException(403, "Access Forbidden");
    const record = await this.trainer.findOne({
      include: {
        model: this.course,
        where: {
          id: courseDetails.id,
        },
      },
      where: {
        user_id: trainer.id,
      },
    });
    if (!record) throw new HttpException(403, "Forbidden Resource");

    const filePath = file?.path.split("/").splice(-2).join("/");
    if (filePath) courseDetails.thumbnail = `${API_BASE}/media/${filePath}`;
    const updateCourse = await this.course.update(
      {
        ...courseDetails,
      },
      {
        where: {
          id: courseDetails.id,
        },
        returning: true,
      }
    );
    return { count: updateCourse[0], rows: updateCourse[1] };
  }
}
export default CourseService;
