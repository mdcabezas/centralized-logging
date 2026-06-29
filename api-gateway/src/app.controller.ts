import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateLogDto } from './dto/create-log.dto';

@Controller()
export class AppController {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  @Post('log')
  createLog(@Body() dto: CreateLogDto) {
    const payload = {
      level: dto.level,
      service: dto.service,
      message: dto.message,
      timestamp: new Date().toISOString(),
    };

    this.kafkaClient.emit('app-logs', payload);

    return { status: 'ok', sent: payload };
  }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }
}
