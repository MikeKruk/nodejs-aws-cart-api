import { OrderStatus } from '../type';

export type Order = {
  id?: string;
  userId: string;
  cartId: string;
  payment: Record<string, unknown>;
  delivery: Record<string, unknown>;
  comments: string;
  status: OrderStatus;
  total: number;
};
