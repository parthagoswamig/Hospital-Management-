import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getRoot() {
    return {
      name: 'HMS SaaS API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        docs: '/docs',
        api: '/api',
      },
      message: 'Hospital Management System SaaS API - Visit /docs for API documentation',
    };
  }

  @Get('health')
  async getHealth() {
    let dbStatus = 'disconnected';
    let dbError = null;
    
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'HMS SaaS API',
      database: dbStatus,
      ...(dbError && { dbError }),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
      },
    };
  }
}
