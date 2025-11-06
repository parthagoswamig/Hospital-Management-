import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';

const server = express();
let isInitialized = false;

async function bootstrap() {
  if (!isInitialized) {
    try {
      console.log('Initializing NestJS...');
      
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
        {
          logger: ['error', 'warn', 'log'],
        }
      );

      app.enableCors({
        origin: true,
        credentials: true,
      });

      app.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          whitelist: true,
        })
      );

      await app.init();
      isInitialized = true;
      console.log('NestJS initialized');
    } catch (error) {
      console.error('Bootstrap failed:', error);
      throw error;
    }
  }
}

export default async (req: Request, res: Response) => {
  await bootstrap();
  server(req, res);
};
