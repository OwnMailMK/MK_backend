import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RefreshGuard } from './guards/refresh.guard';
import { AccessGaurd } from './guards/access.guard';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('/profile')
  @ApiBearerAuth()
  @UseGuards(AccessGaurd)
  async profile(@Req() req: Request) {
    return await this.authService.profile(req.user);
  }

  @Post('register')
  async register(@Res() res: Response, @Body() registerDto: RegisterDto) {
    const refreshToken = await this.authService.register(registerDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });
    res.send(refreshToken);
  }

  @Post('login')
  async login(@Res() res: Response, @Body() LoginDto: LoginDto) {
    const refreshToken = await this.authService.login(LoginDto);

    const fron_url = this.config.get<string>('FRONTEND_URL');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });
    res.send(refreshToken);
    res.redirect(`${fron_url}/inbox`);
  }

  @Get('logout')
  @ApiBearerAuth()
  @UseGuards(AccessGaurd)
  async logout(@Res() res: Response) {
    res.clearCookie('refreshToken');
    res.send('ok');
  }

  @Post('refresh')
  @ApiBearerAuth()
  @UseGuards(RefreshGuard)
  async refresh(@Req() req: Request) {
    return await this.authService.generateAccessToken(req.user);
  }
}
