import { Controller, Get } from '@nestjs/common';
import { DashboardApiService } from './dashboard-api.service';

@Controller()
export class DashboardApiController {
  constructor(private readonly dashboardApiService: DashboardApiService) {}

  @Get()
  getHello(): string {
    return this.dashboardApiService.getHello();
  }
}
