import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getProtoPath } from '@davidpaz06/shared';
import { ServerCredentials } from '@grpc/grpc-js';

async function bootstrap() {
  try {
    console.log('🏗️ Creating NestJS application...');
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    console.log('✅ NestJS app created successfully');

    const httpPort = process.env.PORT || 3000;
    const grpcPort = process.env.GRPC_PORT || 50051;
    const grpcHost = process.env.HOST || '0.0.0.0';
    const grpcUrl = `${grpcHost}:${grpcPort}`;

    console.log('🚀 Starting Academy service...');
    console.log('🔍 Network Configuration:');
    console.log('HOST:', process.env.HOST || '0.0.0.0');
    console.log('GRPC_PORT:', process.env.GRPC_PORT || 50051);
    console.log('PORT:', process.env.PORT || 3000);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    console.log('🔍 Environment Check:');
    console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
    console.log('GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID);
    console.log('HF_TOKEN configured:', !!process.env.HF_TOKEN);
    console.log('GITHUB_TOKEN configured:', !!process.env.GITHUB_TOKEN);

    console.log('🚀 Configuring gRPC at:', grpcUrl);
    console.log('🌐 HTTP server will run on port:', httpPort);

    // Configurar gRPC con puerto separado
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
          package: [
            'academy.courses.v1',
            'academy.roadmaps.v1',
            'academy.grading.v1',
          ],
          protoPath: [
            getProtoPath('courses'),
            getProtoPath('roadmaps'),
            getProtoPath('grading'),
          ],
          url: grpcUrl,
          credentials: ServerCredentials.createInsecure(),
          keepalive: {
            keepaliveTimeMs: 30000,
            keepaliveTimeoutMs: 5000,
            keepalivePermitWithoutCalls: 1,
            http2MaxPingsWithoutData: 0,
            http2MinTimeBetweenPingsMs: 10000,
            http2MinPingIntervalWithoutDataMs: 300000,
          },
        },
      });
      console.log('✅ gRPC microservice configured successfully');
    } catch (error) {
      console.error('❌ Error configuring gRPC:', error);
      throw error;
    }

    // Health check endpoint - CRÍTICO para Railway
    app.getHttpAdapter().get('/health', (req, res) => {
      try {
        console.log('🩺 Health check requested');
        res.status(200).json({
          status: 'OK',
          service: 'academy',
          grpc: 'available',
          grpc_url: grpcUrl,
          http_port: httpPort,
          environment: process.env.NODE_ENV,
          packages: [
            'academy.courses.v1',
            'academy.roadmaps.v1',
            'academy.grading.v1',
          ],
          network: {
            mode: 'SEPARATED_PORTS',
            railway_internal: 'campus-api-academy.railway.internal',
            host: process.env.HOST || '0.0.0.0',
            grpc_port: grpcPort,
            http_port: httpPort,
          },
          services: {
            database: !!process.env.DATABASE_URL,
            gcp: !!process.env.GCP_PROJECT_ID,
            xavier: !!process.env.HF_TOKEN,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('❌ Health check error:', error);
        res.status(500).json({
          status: 'ERROR',
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }
    });

    console.log('✅ Health check endpoints configured');

    // Iniciar microservicios gRPC con timeout
    console.log('🚀 Starting gRPC microservices...');
    const grpcStartTimeout = setTimeout(() => {
      console.error('❌ gRPC startup timeout after 30 seconds');
      process.exit(1);
    }, 30000);

    await app.startAllMicroservices();
    clearTimeout(grpcStartTimeout);
    console.log('✅ gRPC microservices started successfully');

    // Iniciar servidor HTTP con timeout - EN PUERTO DIFERENTE
    console.log('🚀 Starting HTTP server...');
    const httpStartTimeout = setTimeout(() => {
      console.error('❌ HTTP server startup timeout after 30 seconds');
      process.exit(1);
    }, 30000);

    await app.listen(httpPort, '0.0.0.0');
    clearTimeout(httpStartTimeout);

    console.log(`🚀 Academy HTTP server running on port ${httpPort}`);
    console.log(`🚀 Academy gRPC microservice running on ${grpcUrl}`);
    console.log(
      `🩺 Health check available at: http://0.0.0.0:${httpPort}/health`,
    );
    console.log(
      `🛡️ Client origin validation: ${process.env.NODE_ENV === 'production' ? 'ENABLED' : 'DEVELOPMENT MODE'}`,
    );
    console.log(
      `📦 Packages: academy.courses.v1, academy.roadmaps.v1, academy.grading.v1`,
    );
    console.log(
      `🌐 Railway mode: Separated ports - gRPC:${grpcPort}, HTTP:${httpPort}`,
    );
    console.log('🎉 Academy service fully initialized and ready!');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      app.close().then(() => process.exit(0));
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      app.close().then(() => process.exit(0));
    });
  } catch (error) {
    console.error('❌ Failed to start Academy service:', error);
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error('❌ Error details:', {
        error: error,
      });
    }

    // Log variables de entorno para debug
    console.error('❌ Environment at failure:', {
      NODE_ENV: process.env.NODE_ENV,
      HOST: process.env.HOST,
      PORT: process.env.PORT,
      GRPC_PORT: process.env.GRPC_PORT,
      DATABASE_URL: process.env.DATABASE_URL ? '[CONFIGURED]' : '[MISSING]',
      GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || '[MISSING]',
      HF_TOKEN: process.env.HF_TOKEN ? '[CONFIGURED]' : '[MISSING]',
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? '[CONFIGURED]' : '[MISSING]',
    });

    process.exit(1);
  }
}

void bootstrap();
