import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CryptoPriceService } from '../crypto-price/crypto-price.service';
import { Price } from '../entities/price.entity';
import { Alert } from '../entities/alert.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly cryptoPriceService: CryptoPriceService,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
  ) {}

  @Cron('*/5 * * * *')
  async handleCron() {
    await this.cryptoPriceService.savePrice('eth');
    await this.cryptoPriceService.savePrice('polygon');

    const alerts = await this.alertRepository.find();
    for (const alert of alerts) {
      const recentPrices = await this.priceRepository.find({
        where: { chain: alert.chain },
        order: { timestamp: 'DESC' },
        take: 2,
      });

      if (recentPrices.length === 2) {
        const priceOneHourAgo = recentPrices[1].price;
        const currentPrice = recentPrices[0].price;
        const percentChange =
          ((currentPrice - priceOneHourAgo) / priceOneHourAgo) * 100;

        if (percentChange > 3) {
          await this.cryptoPriceService.sendEmail({
            email: alert.email,
            chain: alert.chain,
            price: currentPrice,
          });
        }
      }
    }
  }
}
