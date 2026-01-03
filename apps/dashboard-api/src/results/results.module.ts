import { Module } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    DatabaseModule
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}