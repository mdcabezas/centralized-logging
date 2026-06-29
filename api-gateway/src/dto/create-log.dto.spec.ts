import { validate } from 'class-validator';
import { CreateLogDto } from './create-log.dto';

describe('CreateLogDto', () => {
  it('should pass with valid data', async () => {
    const dto = new CreateLogDto();
    dto.level = 'info';
    dto.service = 'test';
    dto.message = 'hello';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid level', async () => {
    const dto = new CreateLogDto();
    dto.level = 'debug';
    dto.service = 'test';
    dto.message = 'hello';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
  });

  it('should fail when service is empty', async () => {
    const dto = new CreateLogDto();
    dto.level = 'info';
    dto.service = '';
    dto.message = 'hello';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
  });

  it('should fail when message is missing', async () => {
    const dto = new CreateLogDto();
    dto.level = 'info';
    dto.service = 'test';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
  });
});
