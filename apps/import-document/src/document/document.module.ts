import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    
    ClientsModule.registerAsync([
      {
        name: 'SOLVER_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const url = configService.get<string>('RABBITMQ_URL');
          if (!url) {
            throw new Error('RABBITMQ_URL is not defined');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue: 'optimization_jobs',
              queueOptions: {
                durable: true,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}