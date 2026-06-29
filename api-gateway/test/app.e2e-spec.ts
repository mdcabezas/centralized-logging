import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';

describe('App (e2e)', () => {
  let app: INestApplication;
  const mockClient = { emit: jest.fn(), connect: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('KAFKA_SERVICE')
      .useValue(mockClient)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  it('POST /log returns 201 with valid payload', () => {
    return request(app.getHttpServer())
      .post('/log')
      .send({ level: 'info', service: 'test', message: 'hello' })
      .expect(201);
  });

  it('POST /log returns 400 with invalid level', () => {
    return request(app.getHttpServer())
      .post('/log')
      .send({ level: 'invalid', service: 'test', message: 'hello' })
      .expect(400);
  });

  it('POST /log returns 400 with missing service', () => {
    return request(app.getHttpServer())
      .post('/log')
      .send({ level: 'info', message: 'hello' })
      .expect(400);
  });

  it('POST /log returns 400 with empty body', () => {
    return request(app.getHttpServer())
      .post('/log')
      .send({})
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
