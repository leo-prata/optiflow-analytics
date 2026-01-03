import { Module } from '@nestjs/common';
import { SolverProcessController } from './solver-process.controller';
import { SolverProcessService } from './solver-process.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
  ],
  controllers: [SolverProcessController],
  providers: [SolverProcessService],
})
export class SolverProcessModule {}