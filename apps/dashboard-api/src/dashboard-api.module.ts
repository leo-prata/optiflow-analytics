import { Module } from '@nestjs/common';
import { ResultsModule } from './results/results.module';
import { DatabaseModule } from '@app/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: parseInt(configService.get('REDIS_PORT') || '6379'),
          },
          ttl: 1000000,
        }),
      }),
      inject: [ConfigService],
    }),

    DatabaseModule,
    ResultsModule,
  ],
  controllers: [],
  providers: [],
})
export class DashboardApiModule {}