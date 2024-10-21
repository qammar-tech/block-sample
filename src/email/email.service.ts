import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'meetmrammar@gmail.com',
      pass: 'ltyy wwtm jftz ftuj',
    },
  });

  async sendAlert(email: string, message: string) {
    const mailOptions = {
      from: 'meetmrammar@gmail.com',
      to: 'ammarp03@gmail.com',
      subject: 'Price Alert',
      text: message,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
