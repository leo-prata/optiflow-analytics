import { Test, TestingModule } from '@nestjs/testing';
import { SolverProcessController } from './solver-process.controller';
import { SolverProcessService } from './solver-process.service';

describe('SolverProcessController', () => {
  let solverProcessController: SolverProcessController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SolverProcessController],
      providers: [SolverProcessService],
    }).compile();

    solverProcessController = app.get<SolverProcessController>(SolverProcessController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(solverProcessController.getHello()).toBe('Hello World!');
    });
  });
});
