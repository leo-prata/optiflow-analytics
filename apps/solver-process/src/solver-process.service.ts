import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@app/database';
import * as Papa from 'papaparse';
const solver = require('javascript-lp-solver');

export interface ConstraintConfig {
  csvColumn: string;
  operator: '<=' | '>=' | '=';
  rhs: number;
}

export interface OptimizationConfig {
  direction: 'max' | 'min';
  variableNameColumn: string;
  objectiveColumn: string;
  constraints: ConstraintConfig[];
  integerVariables?: string[];
}

export interface JobPayload {
  filename: string;
  content: string;
  config: OptimizationConfig;
}

@Injectable()
export class SolverProcessService {
  private readonly logger = new Logger(SolverProcessService.name);

  constructor(private prisma: DatabaseService) {}

  async solveOptimizationJob(data: JobPayload) {
    this.logger.log(`Iniciando análise do arquivo: ${data.filename}`);

    const record = await this.prisma.optimizationResult.create({
      data: {
        filename: data.filename,
        status: 'PENDING',
      },
    });

    try {
      const model = this.buildModelFromCsv(data.content, data.config);
      const resolution = solver.Solve(model);

      if (!resolution.feasible) {
        throw new Error('O modelo é inviável matematicamente (não existe solução que atenda a todas as restrições).');
      }

      this.logger.log(`Valor Ótimo da Função Objetivo: ${resolution.result}`);

      await this.prisma.optimizationResult.update({
        where: { id: record.id },
        data: {
          status: 'COMPLETED',
          result: resolution as any,
          logs: `Otimização concluída. Função Objetivo: ${resolution.result}`,
        },
      });

    } catch (error) {
      this.logger.error(`Falha no processamento: ${error.message}`);
      
      await this.prisma.optimizationResult.update({
        where: { id: record.id },
        data: {
          status: 'FAILED',
          logs: error.message,
        },
      });
    }
  }

  private buildModelFromCsv(csvContent: string, config: OptimizationConfig): any {
    const rows = this.parseCsvToJson(csvContent);

    if (rows.length === 0) throw new BadRequestException("O arquivo CSV está vazio.");
    
    const headers = Object.keys(rows[0]);
    this.validateColumns(headers, config);

    const model = {
      optimize: config.objectiveColumn,
      opType: config.direction,
      constraints: {},
      variables: {},
      ints: {} 
    };

    config.constraints.forEach(rule => {
      model.constraints[rule.csvColumn] = {};
      
      if (rule.operator === '<=') {
        model.constraints[rule.csvColumn].max = rule.rhs;
      } else if (rule.operator === '>=') {
        model.constraints[rule.csvColumn].min = rule.rhs;
      } else if (rule.operator === '=') {
        model.constraints[rule.csvColumn].equal = rule.rhs;
      }
    });

    rows.forEach((row, index) => {
      const varName = row[config.variableNameColumn];
      if (!varName) return;
      
      const cleanVarName = String(varName).trim();
      
      model.variables[cleanVarName] = {};

      const objValue = this.parseNumber(row[config.objectiveColumn], config.objectiveColumn, index);
      model.variables[cleanVarName][config.objectiveColumn] = objValue;

      config.constraints.forEach(rule => {
        const consumption = this.parseNumber(row[rule.csvColumn], rule.csvColumn, index);
        model.variables[cleanVarName][rule.csvColumn] = consumption;
      });

      if (config.integerVariables && config.integerVariables.includes(cleanVarName)) {
        model.ints[cleanVarName] = 1;
      }
    });

    return model;
  }

  private parseCsvToJson(csv: string): any[] {
    const parsed = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    if (parsed.errors.length > 0) {
      throw new BadRequestException(`Erro ao ler CSV: ${parsed.errors[0].message}`);
    }

    return parsed.data as any[];
  }

  private parseNumber(value: any, colName: string, rowIndex: number): number {
    const normalized = String(value).replace(',', '.');
    const num = parseFloat(normalized);
    
    if (isNaN(num)) {
      throw new BadRequestException(
        `Valor inválido na linha ${rowIndex + 1}, coluna '${colName}': '${value}' não é um número.`
      );
    }
    return num;
  }

  private validateColumns(headers: string[], config: OptimizationConfig) {
    const missing: string[] = []; 
    
    if (!headers.includes(config.variableNameColumn)) missing.push(config.variableNameColumn);
    if (!headers.includes(config.objectiveColumn)) missing.push(config.objectiveColumn);
    
    config.constraints.forEach(c => {
      if (!headers.includes(c.csvColumn)) missing.push(c.csvColumn);
    });

    if (missing.length > 0) {
      throw new BadRequestException(`Colunas configuradas não existem no CSV: ${missing.join(', ')}`);
    }
  }
}