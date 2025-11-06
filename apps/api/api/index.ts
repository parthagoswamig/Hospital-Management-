import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    try {
      console.log('Starting NestJS initialization...');
      
      app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
        {
          logger: console,
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
      console.log('NestJS initialized successfully');
    } catch (error) {
      console.error('Bootstrap error:', error);
      throw error;
    }
  }
}

// Initialize on cold start
bootstrap().catch(console.error);

export default server;
