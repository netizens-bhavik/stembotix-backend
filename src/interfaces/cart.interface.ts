import Paranoid from './paranoid.interface';

export interface Cart extends Paranoid {
  id: string;
  user_id: string;
}
export interface CartItem extends Paranoid {
  id: string;
  quantity: number;
  item_type: string;
  product_id: string;
  CartId: string;
  course_id: string | null;
  ProductId: string | null;
}
