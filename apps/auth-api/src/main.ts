import { NestFactory } from '@nestjs/core';
import { AuthApiModule } from './auth-api.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthApiModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
