import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @Inject('SOLVER_SERVICE') private client: ClientProxy,
  ) {}

  async processUpload(file: Express.Multer.File, config: any) {
    this.logger.log(`Arquivo recebido: ${file.originalname}`);

    const payload = {
      filename: file.originalname,
      content: file.buffer.toString('utf-8'),
      config: config
    };

    this.client.emit('job_created', payload);
    
    this.logger.log('Mensagem enviada para fila RabbitMQ!');

    return {
      message: 'Arquivo enfileirado para processamento',
      status: 'QUEUED'
    };
  }
}