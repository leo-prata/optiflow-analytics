import { Test, TestingModule } from '@nestjs/testing';
import { SolverProcessService } from './solver-process.service';
import { DatabaseService } from '@app/database';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('SolverProcessService (Unit Tests)', () => {
  let service: SolverProcessService;
  let prismaMock: DeepMockProxy<DatabaseService>;

  beforeEach(async () => {
    prismaMock = mockDeep<DatabaseService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolverProcessService,
        { provide: DatabaseService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SolverProcessService>(SolverProcessService);
  });

  it('Deve falhar se o arquivo CSV estiver vazio', async () => {
    prismaMock.optimizationResult.create.mockResolvedValue({ id: 1 } as any);

    await service.solveOptimizationJob({
      filename: 'vazio.csv',
      content: '',
      config: {
        direction: 'max',
        variableNameColumn: 'Produto',
        objectiveColumn: 'Lucro',
        constraints: []
      }
    });

    expect(prismaMock.optimizationResult.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'FAILED',
        }),
      })
    );
  });

  it('Deve processar um CSV válido e encontrar solução viável', async () => {
    prismaMock.optimizationResult.create.mockResolvedValue({ id: 2 } as any);

    const csvContent = `Produto,Lucro,Recurso\nItemA,10,2\nItemB,20,5`;
    
    await service.solveOptimizationJob({
      filename: 'teste_valido.csv',
      content: csvContent,
      config: {
        direction: 'max',
        variableNameColumn: 'Produto',
        objectiveColumn: 'Lucro',
        constraints: [
          { csvColumn: 'Recurso', operator: '<=', rhs: 100 }
        ]
      }
    });

    expect(prismaMock.optimizationResult.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 2 },
        data: expect.objectContaining({
          status: 'COMPLETED',
          logs: expect.stringContaining('Otimização concluída'),
        }),
      })
    );
  });
});