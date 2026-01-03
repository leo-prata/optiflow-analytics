import { NestFactory } from '@nestjs/core';
import { DashboardApiModule } from './dashboard-api.module';

async function bootstrap() {
  const app = await NestFactory.create(DashboardApiModule);
  await app.listen(3003, '0.0.0.0');
}
bootstrap();
