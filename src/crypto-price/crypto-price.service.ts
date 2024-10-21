import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Price } from '../entities/price.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';

@Injectable()
export class CryptoPriceService {
  private moralisApiKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjUwNjg5MTE0LTUzYTItNDgwNi04M2FiLWJkN2IzZTEwMDJiOSIsIm9yZ0lkIjoiNDExOTI4IiwidXNlcklkIjoiNDIzMzE4IiwidHlwZUlkIjoiZDk1NDllMDgtMWYzNy00MjQ5LWIxNWMtNjAwZTI3Njc4YzYzIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjkwMTg5MTYsImV4cCI6NDg4NDc3ODkxNn0.rtx-l1C4bBvgCrcBbWl7u0902s7AtNAkvszcUKCXtbU'; // Add your Moralis API key here.

  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
  ) {}

  async getPrice(chain: string): Promise<number> {
    const url = `https://deep-index.moralis.io/api/v2/erc20/prices?chain=${chain}`;
    const response = await axios.get(url, {
      headers: {
        'X-API-Key': this.moralisApiKey,
      },
    });
    return response.data[0].price;
  }

  async savePrice(chain: string): Promise<void> {
    const price = await this.getPrice(chain);
    const newPrice = this.priceRepository.create({
      chain,
      price,
      timestamp: new Date(),
    });
    await this.priceRepository.save(newPrice);
  }

  async getEthToBtcRate(): Promise<number> {
    const url =
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd';
    const response = await axios.get(url);
    const ethPrice = response.data.ethereum.usd;
    const btcPrice = response.data.bitcoin.usd;

    return ethPrice / btcPrice;
  }

  async sendEmail(alert: { email: string; chain: string; price: number }) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'meetmrammar@gmail.com',
        pass: 'ltyy wwtm jftz ftuj',
      },
    });

    await transporter.sendMail({
      from: 'meetmrammar@gmail.com',
      to: 'hyperhire_assignment@hyperhire.in',
      subject: `Price Alert for ${alert.chain}`,
      text: `The price of ${alert.chain} has increased by more than 3%. Current price: $${alert.price}.`,
    });
  }
}
