import { NestFactory } from '@nestjs/core';
import { SolverProcessModule } from './solver-process.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SolverProcessModule);
  const configService = appContext.get(ConfigService);
  const rabbitUrl = configService.get<string>('RABBITMQ_URL');

  if (!rabbitUrl) {
    throw new Error('RABBITMQ_URL environment variable is not set');
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SolverProcessModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: 'optimization_jobs',
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  
  await app.listen();
  console.log('Solver Worker está ouvindo a fila RabbitMQ');
  await appContext.close();
}
bootstrap();