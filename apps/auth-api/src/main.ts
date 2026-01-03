import { NestFactory } from '@nestjs/core';
import { AuthApiModule } from './auth-api.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthApiModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.listen(3001, '0.0.0.0');
}
bootstrap();
