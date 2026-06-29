import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Database } from './database/database';
import { KafkaContext } from '@nestjs/microservices';

describe('AppController', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });
  let controller: AppController;
  let database: { insertLog: jest.Mock; onModuleDestroy: jest.Mock };

  beforeEach(async () => {
    database = { insertLog: jest.fn(), onModuleDestroy: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: Database, useValue: database }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('handleLog', () => {
    it('should insert log into database', async () => {
      const message = { level: 'info', service: 'test', message: 'hello', timestamp: '2026-01-01T00:00:00.000Z' };
      const context = { getMessage: () => ({ offset: '0' }) } as KafkaContext;
      await controller.handleLog(message, context);
      expect(database.insertLog).toHaveBeenCalledWith('info', 'test', 'hello', '2026-01-01T00:00:00.000Z');
    });

    it('should log saved message on success', async () => {
      const message = { level: 'info', service: 'test', message: 'hello', timestamp: '2026-01-01T00:00:00.000Z' };
      const context = { getMessage: () => ({ offset: '5' }) } as KafkaContext;
      await controller.handleLog(message, context);
      expect(database.insertLog).toHaveBeenCalled();
    });

    it('should handle database error gracefully', async () => {
      database.insertLog.mockRejectedValue(new Error('DB error'));
      const message = { level: 'info', service: 'test', message: 'hello', timestamp: '2026-01-01T00:00:00.000Z' };
      const context = { getMessage: () => ({ offset: '0' }) } as KafkaContext;
      await expect(controller.handleLog(message, context)).resolves.toBeUndefined();
    });
  });
});
