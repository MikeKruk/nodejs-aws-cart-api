import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DATABASE_POOL } from 'src/database/database.module';
import { Order } from '../models';
import { CreateOrderPayload, OrderStatus } from '../type';

@Injectable()
export class OrderService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getAll(): Promise<Order[]> {
    const { rows } = await this.pool.query<Order>(`SELECT * FROM orders`);
    return rows;
  }

  async findById(orderId: string): Promise<Order | null> {
    const { rows } = await this.pool.query<Order>(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId],
    );
    return rows[0] ?? null;
  }

  async create(data: CreateOrderPayload): Promise<Order> {
    const id = randomUUID() as string;
    const { rows } = await this.pool.query<Order>(
      `INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, status, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        id,
        data.userId,
        data.cartId,
        JSON.stringify({}),
        JSON.stringify(data.address),
        data.address.comment,
        OrderStatus.Open,
        data.total,
      ],
    );
    return rows[0];
  }

  // TODO add  type
  async update(orderId: string, data: Order): Promise<void> {
    await this.pool.query(`UPDATE orders SET status = $1 WHERE id = $2`, [
      orderId,
      data.status,
    ]);
  }
}
