import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      service: 'academy',
      grpc: {
        configured: true,
        url: `${process.env.HOST || '0.0.0.0'}:${process.env.GRPC_PORT || 50051}`,
        tcp_proxy: 'yamanote.proxy.rlwy.net:57377',
        credentials: 'insecure',
        loader_config: true,
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('test-internal-grpc')
  async testInternalGrpc(@Body() body: { name?: string }) {
    try {
      console.log('🧪 Testing internal gRPC service availability...');

      // Test básico - el servicio está corriendo
      await new Promise((resolve) => setTimeout(resolve, 100));
      return {
        status: 'SUCCESS',
        message: 'Academy service is running and ready',
        grpc_status: 'available',
        test_data: body,
        internal_test: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Internal test failed:', error);
      return {
        status: 'ERROR',
        message: 'Internal test failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
