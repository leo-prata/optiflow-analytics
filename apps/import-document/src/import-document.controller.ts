import { Controller, Get } from '@nestjs/common';
import { ImportDocumentService } from './import-document.service';

@Controller()
export class ImportDocumentController {
  constructor(private readonly importDocumentService: ImportDocumentService) {}

  @Get()
  getHello(): string {
    return this.importDocumentService.getHello();
  }
}
