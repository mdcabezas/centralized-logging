import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class CreateLogDto {
  @IsString()
  @IsIn(['info', 'warn', 'error'])
  level: string;

  @IsString()
  @IsNotEmpty()
  service: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
