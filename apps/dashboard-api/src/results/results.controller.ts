import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ResultsService } from './results.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('results')
@UseInterceptors(CacheInterceptor) 
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  @CacheTTL(5000)
  findAll() {
    return this.resultsService.findAll();
  }

  @Get(':id')
  @CacheTTL(60000)
  findOne(@Param('id') id: string) {
    return this.resultsService.findOne(id);
  }
}