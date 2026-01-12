import { NestFactory } from '@nestjs/core';
import { ImportDocumentModule } from './import-document.module';

async function bootstrap() {
  const app = await NestFactory.create(ImportDocumentModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3002, '0.0.0.0');
}
bootstrap();
