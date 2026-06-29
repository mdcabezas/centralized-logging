import { Controller, Logger } from '@nestjs/common';
import { Ctx, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';
import { Database } from './database/database';

interface LogPayload {
  level: string;
  service: string;
  message: string;
  timestamp: string;
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly database: Database) {}

  @MessagePattern('app-logs')
  async handleLog(@Payload() message: LogPayload, @Ctx() context: KafkaContext) {
    try {
      const payload = message;

      await this.database.insertLog(
        payload.level,
        payload.service,
        payload.message,
        payload.timestamp,
      );

      const { offset } = context.getMessage();
      this.logger.log(
        `Log saved | offset: ${offset} | ${payload.level} | ${payload.service} | ${payload.message}`,
      );
    } catch (error) {
      this.logger.error(`Error processing message: ${(error as Error).message}`);
    }
  }
}
