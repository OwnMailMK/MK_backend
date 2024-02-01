import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessGaurd } from 'src/auth/guards/access.guard';

@Controller('inbox')
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AccessGaurd)
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  async getInbox(@Query('page') page: number = 1) {
    return await this.inboxService.pagenate(page);
  }
}
