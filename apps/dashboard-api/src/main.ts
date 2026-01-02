import { NestFactory } from '@nestjs/core';
import { DashboardApiModule } from './dashboard-api.module';

async function bootstrap() {
  const app = await NestFactory.create(DashboardApiModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
