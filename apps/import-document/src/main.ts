import { NestFactory } from '@nestjs/core';
import { ImportDocumentModule } from './import-document.module';

async function bootstrap() {
  const app = await NestFactory.create(ImportDocumentModule);
  await app.listen(3002, '0.0.0.0');
}
bootstrap();
