import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class Database implements OnModuleDestroy {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'logs',
    });

    this.init();
  }

  private async init() {
    const client = await this.pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) NOT NULL,
        service VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        timestamp VARCHAR(30) NOT NULL
      )
    `);
    client.release();
  }

  async insertLog(level: string, service: string, message: string, timestamp: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO logs (level, service, message, timestamp) VALUES ($1, $2, $3, $4)',
      [level, service, message, timestamp],
    );
  }

  async getAllLogs() {
    const result = await this.pool.query('SELECT * FROM logs ORDER BY id DESC LIMIT 100');
    return result.rows;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
