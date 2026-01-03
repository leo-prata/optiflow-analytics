import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  Body,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { config: string }
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    if (!body.config) {
      throw new BadRequestException('O campo "config" é obrigatório');
    }

    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    
    if (!allowedTypes.includes(file.mimetype) && !file.originalname.endsWith('.csv')) {
       throw new BadRequestException(`Tipo inválido: ${file.mimetype}`);
    }

    let parsedConfig;
    try {
      parsedConfig = JSON.parse(body.config);
    } catch (e) {
      throw new BadRequestException('O campo "config" não é um JSON válido');
    }

    return this.documentService.processUpload(file, parsedConfig);
  }
}