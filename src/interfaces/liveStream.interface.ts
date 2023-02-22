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
  categories: string;
}

export interface Subscribe {
  subscriptionPrice: number;
  payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  livestreamId: string;
}
