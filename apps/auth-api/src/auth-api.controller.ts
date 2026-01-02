import { Controller, Get } from '@nestjs/common';
import { AuthApiService } from './auth-api.service';

@Controller()
export class AuthApiController {
  constructor(private readonly authApiService: AuthApiService) {}

  @Get()
  getHello(): string {
    return this.authApiService.getHello();
  }
}
