import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: any;
let initError: any = null;

async function bootstrap() {
  if (initError) {
    throw initError;
  }

  if (!cachedApp) {
    try {
      console.log('Starting NestJS initialization...');
      console.log('Environment:', {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
      });
      
      cachedApp = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });

      console.log('NestJS app created, setting up CORS...');

      cachedApp.enableCors({
        origin: true,
        credentials: true,
      });

      console.log('Setting up validation pipe...');

      cachedApp.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          whitelist: true,
        })
      );

      console.log('Initializing app...');
      await cachedApp.init();
      console.log('✅ NestJS app initialized successfully');
    } catch (error) {
      console.error('❌ Bootstrap failed:', error);
      initError = error;
      throw error;
    }
  }
  
  return cachedApp.getHttpAdapter().getInstance();
}

module.exports = async (req: any, res: any) => {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      error: 'Serverless function initialization failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
