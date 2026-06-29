import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;
  let kafkaClient: { emit: jest.Mock; connect: jest.Mock };

  beforeEach(async () => {
    kafkaClient = { emit: jest.fn(), connect: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: 'KAFKA_SERVICE', useValue: kafkaClient },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('createLog', () => {
    it('should emit to app-logs topic with payload', () => {
      const dto = { level: 'info' as const, service: 'test', message: 'hello' };
      controller.createLog(dto);
      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'app-logs',
        expect.objectContaining(dto),
      );
    });

    it('should return status ok with sent payload', () => {
      const dto = { level: 'info' as const, service: 'test', message: 'hello' };
      const result = controller.createLog(dto);
      expect(result).toEqual({
        status: 'ok',
        sent: expect.objectContaining(dto),
      });
    });

    it('should include timestamp in sent payload', () => {
      const dto = { level: 'info' as const, service: 'test', message: 'hello' };
      const result = controller.createLog(dto);
      expect(result.sent).toHaveProperty('timestamp');
    });
  });
});
