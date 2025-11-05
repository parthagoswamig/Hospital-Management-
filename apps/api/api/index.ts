import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { INestApplication } from '@nestjs/core';

const server = express();

// Global app cache for serverless
declare global {
  // eslint-disable-next-line no-var
  var cachedApp: INestApplication | undefined;
}

async function getApp(): Promise<INestApplication> {
  if (!globalThis.cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: ['error', 'warn', 'log'] }
    );

    // Enable CORS for serverless
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.init();
    globalThis.cachedApp = app;
  }

  return globalThis.cachedApp;
}

export default async (req: express.Request, res: express.Response) => {
  await getApp();
  return server(req, res);
};
