import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';

const logger = new Logger('ServerlessHandler');

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    logger.log('🚀 Initializing NestJS application for Vercel serverless...');
    
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log'] 
        : ['error', 'warn', 'log', 'debug'],
      bodyParser: false, // Disable automatic body parser to avoid Express router check
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

    // Get the Express instance and manually add body parsers
    const expressInstance = app.getHttpAdapter().getInstance();
    const express = require('express');
    
    // Manually add body parsers (since we disabled automatic registration)
    expressInstance.use(express.json({ limit: '10mb' }));
    expressInstance.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Now initialize the app (routes will be set up)
    await app.init();
    
    cachedServer = expressInstance;
    logger.log('✅ NestJS application initialized successfully');
  }
  
  return cachedServer;
}

export default async (req: Request, res: Response) => {
  const server = await bootstrap();
  return server(req, res);
};
