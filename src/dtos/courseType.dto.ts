import { IsString } from "class-validator";

export class CourseTypeDto {
    @IsString()
    public course_type: string;
  

  }