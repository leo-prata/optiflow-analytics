import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '@app/database';
import { BadRequestException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: DeepMockProxy<DatabaseService>;

  beforeEach(async () => {
    prismaMock = mockDeep<DatabaseService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um usuário com senha hashada se o email não existir', async () => {
      const dto: CreateUserDto = {
        name: 'Teste',
        email: 'teste@email.com',
        password: 'senha123',
        role: 'ANALYST',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash_senha123');

      prismaMock.user.create.mockResolvedValue({
        id: '1',
        name: dto.name,
        email: dto.email,
        password: 'hash_senha123',
        role: dto.role ?? 'ANALYST',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(dto);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalled(); 
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result.name).toBe(dto.name);
    });

    it('deve lançar erro se o email já existir', async () => {
      const dto: CreateUserDto = {
        name: 'Teste',
        email: 'existente@email.com',
        password: '123',
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        ...dto,
        role: 'ANALYST',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });
});