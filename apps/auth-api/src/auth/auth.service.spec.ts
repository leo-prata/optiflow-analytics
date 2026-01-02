import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from '@app/database';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: DeepMockProxy<DatabaseService>;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    prismaMock = mockDeep<DatabaseService>();
    
    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue('token_falso_jwt'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('deve retornar o token se as credenciais forem válidas', async () => {
      const loginDto = { email: 'valid@email.com', password: '123' };
      const userNoBanco = {
        id: '1',
        email: 'valid@email.com',
        password: 'hash_senha_correta',
        name: 'User',
        role: 'ANALYST' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(userNoBanco);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'token_falso_jwt');
      expect(jwtServiceMock.signAsync).toHaveBeenCalled();
    });

    it('deve falhar se o usuário não existir', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'inexistente@email.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve falhar se a senha estiver incorreta', async () => {
      const userNoBanco = {
        id: '1',
        email: 'valid@email.com',
        password: 'hash_correto',
        name: 'User',
        role: 'ANALYST' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(userNoBanco);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'valid@email.com', password: 'senha_errada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});