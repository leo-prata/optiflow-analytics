import { Test, TestingModule } from '@nestjs/testing';
import { ImportDocumentController } from './import-document.controller';
import { ImportDocumentService } from './import-document.service';

describe('ImportDocumentController', () => {
  let importDocumentController: ImportDocumentController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ImportDocumentController],
      providers: [ImportDocumentService],
    }).compile();

    importDocumentController = app.get<ImportDocumentController>(ImportDocumentController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(importDocumentController.getHello()).toBe('Hello World!');
    });
  });
});
