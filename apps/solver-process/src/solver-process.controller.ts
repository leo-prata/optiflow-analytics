import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { SolverProcessService } from './solver-process.service';

@Controller()
export class SolverProcessController {
  constructor(private readonly solverService: SolverProcessService) {}

  @EventPattern('job_created')
  async handleJob(@Payload() data: any, @Ctx() context: RmqContext) {
    await this.solverService.solveOptimizationJob(data);
  }
}