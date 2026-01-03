import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@app/database';

@Injectable()
export class ResultsService {
  constructor(private prisma: DatabaseService) {}

  async findAll() {
    return this.prisma.optimizationResult.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        status: true,
        createdAt: true,
      }
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.optimizationResult.findUnique({
      where: { id },
    });

    if (!result) {
      throw new NotFoundException(`Resultado com ID ${id} não encontrado.`);
    }

    return result;
  }
}