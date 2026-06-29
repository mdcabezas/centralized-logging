import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { Database } from './database/database';

@Module({
  controllers: [AppController],
  providers: [Database],
})
export class AppModule {}
