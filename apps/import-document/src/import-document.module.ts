import { Module } from '@nestjs/common';
import { ImportDocumentController } from './import-document.controller';
import { ImportDocumentService } from './import-document.service';

@Module({
  imports: [],
  controllers: [ImportDocumentController],
  providers: [ImportDocumentService],
})
export class ImportDocumentModule {}
