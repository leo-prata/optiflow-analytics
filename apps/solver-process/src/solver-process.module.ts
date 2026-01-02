import { Module } from '@nestjs/common';
import { SolverProcessController } from './solver-process.controller';
import { SolverProcessService } from './solver-process.service';

@Module({
  imports: [],
  controllers: [SolverProcessController],
  providers: [SolverProcessService],
})
export class SolverProcessModule {}
