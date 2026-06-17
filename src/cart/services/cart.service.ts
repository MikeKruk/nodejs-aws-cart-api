import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { DATABASE_POOL } from 'src/database/database.module';
import { PutCartPayload } from 'src/order/type';
import { Cart, CartItemRow, CartRow, CartStatuses } from '../models';

@Injectable()
export class CartService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const { rows: carts } = await this.pool.query<CartRow>(
      `SELECT * FROM carts WHERE user_id = $1 AND status = 'OPEN' LIMIT 1`,
      [userId],
    );

    if (!carts[0]) return null;

    const { rows: items } = await this.pool.query<CartItemRow>(
      `SELECT * FROM cart_items WHERE cart_id = $1`,
      [carts[0].id],
    );

    return {
      ...carts[0],
      items: items.map((item) => ({
        product: {
          id: item.product_id,
          title: '',
          description: '',
          price: 0,
        },
        count: item.count,
      })),
    };
  }

  async createByUserId(user_id: string): Promise<Cart> {
    const id = randomUUID();
    const { rows } = await this.pool.query<CartRow>(
      `INSERT INTO carts (id, user_id, status) VALUES ($1, $2, $3) RETURNING *`,
      [id, user_id, CartStatuses.OPEN],
    );

    return { ...rows[0], items: [] };
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    const cart = await this.findOrCreateByUserId(userId);
    const { rows: existing } = await this.pool.query<CartItemRow>(
      `SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cart.id, payload.product.id],
    );

    if (existing.length === 0) {
      await this.pool.query<CartItemRow>(
        `INSERT INTO cart_items (cart_id, product_id, count) VALUES ($1, $2, $3)`,
        [cart.id, payload.product.id, payload.count],
      );
    } else if (payload.count === 0) {
      await this.pool.query<CartItemRow>(
        `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
        [cart.id, payload.product.id],
      );
    } else {
      await this.pool.query<CartItemRow>(
        `UPDATE cart_items SET count = $1 WHERE cart_id = $2 AND product_id = $3`,
        [payload.count, cart.id, payload.product.id],
      );
    }

    return this.findByUserId(userId);
  }

  async removeByUserId(userId): Promise<void> {
    const cart = await this.findByUserId(userId);
    if (cart) {
      await this.pool.query(`DELETE FROM cart_items WHERE cart_id = $1`, [
        cart.id,
      ]);
      await this.pool.query(`DELETE FROM carts WHERE id =$1`, [cart.id]);
    }
  }
}
