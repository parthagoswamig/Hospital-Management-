import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { Request, Response } from 'express';

const expressApp = express();
const logger = new Logger('ServerlessHandler');

let app: any;

async function bootstrap() {
  if (!app) {
    logger.log('🚀 Initializing NestJS application for Vercel serverless...');
    
    const adapter = new ExpressAdapter(expressApp);
    app = await NestFactory.create(AppModule, adapter, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log'] 
        : ['error', 'warn', 'log', 'debug'],
      cors: false, // We'll configure CORS manually
    });

    // CORS Configuration with strict allow-list
    const corsOriginsEnv = process.env.CORS_ORIGINS || 'https://hma-sass-web.vercel.app';
    const parsedOrigins = corsOriginsEnv
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (parsedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow all Vercel domains
        if (origin.endsWith('.vercel.app') || origin.endsWith('.vercel.com')) {
          return callback(null, true);
        }

        // For development - allow localhost with any port
        if (
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true);
        }

        // Reject other origins
        logger.warn(`CORS rejected origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Requested-With',
        'X-Tenant-Id',
      ],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      maxAge: 3600,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('HMS SaaS API')
      .setDescription('Hospital Management System SaaS API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(process.env.PUBLIC_API_URL || 'https://hma-saas-api.vercel.app', 'Production')
      .addServer('http://localhost:3000', 'Local Development')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    // Initialize without Express middleware registration
    await app.init();
    logger.log('✅ NestJS application initialized successfully');
  }
  
  return expressApp;
}

export default async (req: Request, res: Response) => {
  try {
    await bootstrap();
    expressApp(req, res);
  } catch (error) {
    logger.error('❌ Serverless function error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
};
