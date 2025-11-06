import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    console.log('Initializing NestJS application...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
      bodyParser: false,
    });

    // Simple CORS - allow all origins for now
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
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
    try {
      const config = new DocumentBuilder()
        .setTitle('HMS SaaS API')
        .setDescription('Hospital Management System SaaS API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document);
    } catch (error) {
      console.error('Swagger setup failed:', error);
    }

    // Get Express instance
    const expressInstance = app.getHttpAdapter().getInstance();
    const express = require('express');
    
    // Add body parsers
    expressInstance.use(express.json({ limit: '10mb' }));
    expressInstance.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Initialize app
    await app.init();
    
    cachedServer = expressInstance;
    console.log('NestJS initialized successfully');
  }
  
  return cachedServer;
}

export default async (req: Request, res: Response) => {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
