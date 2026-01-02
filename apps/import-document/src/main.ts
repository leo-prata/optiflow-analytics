import { NestFactory } from '@nestjs/core';
import { ImportDocumentModule } from './import-document.module';

async function bootstrap() {
  const app = await NestFactory.create(ImportDocumentModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
