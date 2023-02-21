import { Time } from 'aws-sdk/clients/codedeploy';

export interface LiveStream {
  title: string;
  subscriptionPrice: number;
  description: string;
  thumbnail: string;
  is_active: boolean;
  is_completed: boolean;
  date: Date;
  startTime: Time;
  endTime: Time;
  link: string;
  categories: string;
}
