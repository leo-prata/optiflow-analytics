import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
