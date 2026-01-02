import { Injectable } from '@nestjs/common';

@Injectable()
export class ImportDocumentService {
  getHello(): string {
    return 'Hello World!';
  }
}
