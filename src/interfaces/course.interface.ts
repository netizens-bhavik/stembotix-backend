export interface Course {
  id: string;
  title: string;
  price: number;
  description: string;
  thumbnail: string;
  fullName: string;
  status: string;
  avgRating: string;
  coursetypeId: string;
  courseLevelId: string;
  courseLanguageId: string;
  count: number;
  rows: object;
}
export interface AvgRating {
  id: string;
  title: string;
  price: number;
  description: string;
  thumbnail: string;
  fullName: string;
  status: string;
  avgRatingResponse: string;
  courseLevelId: string;
  courseLanguageId: string;
}
