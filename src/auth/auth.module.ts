import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AccessStrategy } from './strategies/access.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InboxService } from 'src/inbox/inbox.service';
import { Mail } from 'src/inbox/entities/mail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Mail]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secretOrPrivateKey: config.get('ACCESS_TOKEN_SECRET'),
        signOptions: config.get('ACCESS_TOKEN_EXPIRES_IN'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessStrategy,
    RefreshStrategy,
    JwtService,
    InboxService,
  ],
})
export class AuthModule {}
