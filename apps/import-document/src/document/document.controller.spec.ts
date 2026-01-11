import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

describe('DocumentController (Integration with Supertest)', () => {
  let app: INestApplication;
  let rabbitClientMock: Partial<ClientProxy>;

  beforeEach(async () => {
    rabbitClientMock = {
      emit: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        DocumentService,
        {
          provide: 'SOLVER_SERVICE',
          useValue: rabbitClientMock,
        },
      ],
    })

      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/document/upload (POST) - Deve aceitar upload e enviar para fila', async () => {
    const fakeCsv = Buffer.from('Produto,Lucro\nA,10');
    const fakeConfig = JSON.stringify({
      direction: 'max',
      variableNameColumn: 'Produto',
      objectiveColumn: 'Lucro',
      constraints: []
    });

    await request(app.getHttpServer())
      .post('/document/upload')
      .attach('file', fakeCsv, 'teste-integracao.csv')
      .field('config', fakeConfig)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
            message: 'Arquivo enfileirado para processamento',
            status: 'QUEUED'
        });
      });

    expect(rabbitClientMock.emit).toHaveBeenCalledWith(
      'job_created',
      expect.objectContaining({
        filename: 'teste-integracao.csv',
      })
    );
  });

  afterAll(async () => {
    await app.close();
  });
});