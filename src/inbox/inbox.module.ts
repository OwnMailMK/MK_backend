import { Module } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { InboxController } from './inbox.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from './entities/mail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mail])],
  providers: [InboxService],
  controllers: [InboxController],
})
export class InboxModule {}
