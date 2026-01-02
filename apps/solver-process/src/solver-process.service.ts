import { Injectable } from '@nestjs/common';

@Injectable()
export class SolverProcessService {
  getHello(): string {
    return 'Hello World!';
  }
}
