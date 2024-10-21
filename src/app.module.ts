import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceController } from './price/price.controller';
import { Price } from './entities/price.entity';
import { Alert } from './entities/alert.entity';
import { CryptoPriceService } from './crypto-price/crypto-price.service';
import { SchedulerService } from './scheduler/scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres_password',
      database: process.env.DB_DATABASE || 'nest_db',
      entities: [__dirname + '/../**/*.entity.{js,.ts}'],
      synchronize: true, // Don't use synchronize in production
    }),
    TypeOrmModule.forFeature([Price, Alert]),
    // ScheduleModule,
  ],
  controllers: [PriceController],
  providers: [CryptoPriceService, SchedulerService],
})
export class AppModule {}
