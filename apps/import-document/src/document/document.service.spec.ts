import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { ClientProxy } from '@nestjs/microservices';

describe('DocumentService (Integration Test)', () => {
  let service: DocumentService;
  let rabbitMqClientMock: Partial<ClientProxy>;

  beforeEach(async () => {
    rabbitMqClientMock = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: 'SOLVER_SERVICE',
          useValue: rabbitMqClientMock,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('Deve receber arquivo e publicar mensagem no RabbitMQ', async () => {
    const mockFile = {
      originalname: 'dados.csv',
      buffer: Buffer.from('Produto,A,B'),
    } as Express.Multer.File;

    const mockConfig = { direction: 'max' };

    const response = await service.processUpload(mockFile, mockConfig);

    expect(response).toEqual({
      message: 'Arquivo enfileirado para processamento',
      status: 'QUEUED',
    });

    expect(rabbitMqClientMock.emit).toHaveBeenCalledWith(
      'job_created',
      expect.objectContaining({
        filename: 'dados.csv',
        config: mockConfig,
      })
    );
  });
});