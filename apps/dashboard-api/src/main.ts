import { NestFactory } from '@nestjs/core';
import { DashboardApiModule } from './dashboard-api.module';

async function bootstrap() {
  const app = await NestFactory.create(DashboardApiModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3003, '0.0.0.0');
}
bootstrap();
