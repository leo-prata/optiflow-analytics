import { Test, TestingModule } from '@nestjs/testing';
import { AuthApiController } from './auth-api.controller';
import { AuthApiService } from './auth-api.service';

describe('AuthApiController', () => {
  let authApiController: AuthApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthApiController],
      providers: [AuthApiService],
    }).compile();

    authApiController = app.get<AuthApiController>(AuthApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(authApiController.getHello()).toBe('Hello World!');
    });
  });
});
