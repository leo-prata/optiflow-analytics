import { NestFactory } from '@nestjs/core';
import { SolverProcessModule } from './solver-process.module';

async function bootstrap() {
  const app = await NestFactory.create(SolverProcessModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
