import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from 'src/database/database.module';
import { User } from '../models';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findOne(name: string): Promise<User | null> {
    const { rows } = await this.pool.query<User>(
      `SELECT * FROM users WHERE name = $1`,
      [name],
    );
    return rows[0] ?? null;
  }

  async createOne({ name, password }: User): Promise<User> {
    const { rows } = await this.pool.query<User>(
      `INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *`,
      [name, password],
    );

    return rows[0];
  }
}
