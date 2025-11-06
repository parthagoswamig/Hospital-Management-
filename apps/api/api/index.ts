import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

const expressApp = express();
const logger = new Logger('ServerlessHandler');

let app: any;

async function bootstrap() {
  if (!app) {
    logger.log('Initializing NestJS application for serverless...');
    
    const adapter = new ExpressAdapter(expressApp);
    app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn', 'log'],
    });

    // Enable CORS
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    await app.init();
    logger.log('NestJS application initialized successfully');
  }
  return app;
}

export default async (req: Request, res: Response) => {
  try {
    await bootstrap();
    expressApp(req, res);
  } catch (error) {
    logger.error('Serverless function error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
