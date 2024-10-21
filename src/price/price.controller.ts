import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Price } from '../entities/price.entity';
import { Alert } from '../entities/alert.entity';
import { CryptoPriceService } from '../crypto-price/crypto-price.service';

@Controller('price')
export class PriceController {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly cryptoPriceService: CryptoPriceService,
  ) {}

  private readonly ethToBtcRate: number = 0.06;
  private readonly ethPriceInDollars: number = 1800;

  @Get('history')
  async getPriceHistory() {
    const prices = await this.priceRepository.find({
      order: { timestamp: 'DESC' },
      take: 24,
    });
    return prices;
  }

  @Post('alert')
  async setPriceAlert(
    @Body() alertData: { chain: string; targetPrice: number; email: string },
  ) {
    await this.alertRepository.save(alertData);
    return { message: 'Alert set successfully' };
  }

  @Get('swap-rate')
  async getSwapRate(@Query('ethAmount') ethAmount: number) {
    const btcAmount = ethAmount * this.ethToBtcRate;

    const fee = ethAmount * 0.03;

    const feeInDollars = fee * this.ethPriceInDollars;

    return { btcAmount, fee: { eth: fee, dollar: feeInDollars } };
  }

  @Post('send-email')
  async sendEmailAlert(
    @Body() alert: { email: string; chain: string; price: number },
  ) {
    await this.cryptoPriceService.sendEmail(alert);
    return { message: 'Email sent successfully' };
  }
}
