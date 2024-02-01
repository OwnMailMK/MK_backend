import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swagger } from './swagger';
import { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('SERVICE_PORT', 3000);
  const NODE_ENV = config.get<string>('NODE_ENV', 'development');

  let CORS_ORIGIN:
    | boolean
    | string
    | RegExp
    | (string | RegExp)[]
    | CustomOrigin = [];
  if (config.get<string>('CORS_ORIGIN')) {
    CORS_ORIGIN.push(...config.get<string>('CORS_ORIGIN', '*').split(','));
  }
  if (config.get<string>('CORS_REGEX_ORIGIN')) {
    CORS_ORIGIN.push(
      ...config
        .get<string>('CORS_REGEX_ORIGIN', '')
        .split(',')
        .map((regex) => new RegExp(regex)),
    );
  }

  if (CORS_ORIGIN.length === 0) {
    CORS_ORIGIN = true;
  }

  app.enableCors({
    origin: CORS_ORIGIN,
    methods: config.get<string>('CORS_METHODS', 'GET,PUT,PATCH,POST,DELETE'),
    credentials: config.get<boolean>('CORS_CREDENTIALS', true),
    preflightContinue: config.get<boolean>('CORS_PREFLIGHT', false),
    optionsSuccessStatus: config.get<number>('CORS_OPTIONS_STATUS', 204),
  });

  app.use(cookieParser());

  await swagger(app);

  await app.listen(port);

  Logger.log(
    `Server is running on localhost:${port} with ${NODE_ENV} mode`,
    'Bootstrap',
  );
}
bootstrap();
