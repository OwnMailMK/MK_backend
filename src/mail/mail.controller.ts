import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AccessGaurd } from 'src/auth/guards/access.guard';
import { MailService } from './mail.service';
import { MailDto } from './dto/mail.dto';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @ApiBearerAuth()
  @UseGuards(AccessGaurd)
  async send(@Req() req: Request, @Body() mailDto: MailDto) {
    return await this.mailService.send(req.user, mailDto);
  }
}
