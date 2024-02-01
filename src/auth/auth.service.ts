import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { validateEmail, validatePassword } from 'src/validation/auth';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { InboxService } from 'src/inbox/inbox.service';
import { Mail } from 'src/inbox/entities/mail.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly inboxService: InboxService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Mail)
    private readonly mailRepository: Repository<Mail>,
  ) {}

  public async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  public async profile({ email }: Express.User): Promise<string> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    return user.name;
  }

  public async register({
    email,
    name,
    password,
  }: RegisterDto): Promise<string> {
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    if (!validateEmail(email)) {
      throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
    }

    if (!validatePassword(password)) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.userRepository.create({
      email,
      name,
      password: await this.hashPassword(password),
      box: email.split('@')[0],
    });
    await this.userRepository.save(newUser);
    return await this.generateRefreshToken(newUser);
  }

  public async login({ email, password }: LoginDto): Promise<string> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }

    await this.saveMail(email, password);
    return await this.generateRefreshToken(user);
  }

  public async generateAccessToken(user: Express.User): Promise<string> {
    return await this.jwtService.signAsync(
      { ...user },
      {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN'),
      },
    );
  }

  public async generateRefreshToken(user: Express.User): Promise<string> {
    return await this.jwtService.signAsync(
      { ...user },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      },
    );
  }

  public async validateRefreshToken(
    refresh: string,
    email: string,
  ): Promise<boolean> {
    const user = await this.jwtService.verifyAsync(refresh, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });

    return user.email === email ? true : false;
  }

  async saveMail(email: string, password: string) {
    const mail = await this.inboxService.connectImap(email, password);

    for (let i = 0; i < mail.length; i++) {
      const newMail = await this.mailRepository.create({
        id: mail[i].id,
        from: mail[i].from,
        subject: mail[i].subject,
        text: mail[i].text,
        date: mail[i].date,
      });
      await this.mailRepository.save(newMail);
    }
  }
}
