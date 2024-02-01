import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from 'src/types/jwt';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(public readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('ACCESS_TOKEN_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, user: Express.User & Partial<JwtPayload>) {
    delete user.iat;
    delete user.exp;
    return user;
  }
}
