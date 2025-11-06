import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'HMS SaaS API',
      database: 'connected',
    };
  }
}
