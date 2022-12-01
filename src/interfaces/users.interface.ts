export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isEmailVerified: boolean;
  date_of_birth: Date;
  role: string;
}
