import { Controller, Get } from '@nestjs/common';
import { SolverProcessService } from './solver-process.service';

@Controller()
export class SolverProcessController {
  constructor(private readonly solverProcessService: SolverProcessService) {}

  @Get()
  getHello(): string {
    return this.solverProcessService.getHello();
  }
}
