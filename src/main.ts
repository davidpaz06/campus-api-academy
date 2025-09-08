import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getProtoPath } from '@davidpaz06/shared';

async function bootstrap() {
  console.log('🔍 Network Configuration:');
  console.log('HOST:', process.env.HOST || '0.0.0.0');
  console.log('GRPC_PORT:', process.env.GRPC_PORT || 50051);
  console.log('PORT:', process.env.PORT || 3000);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  const app = await NestFactory.create(AppModule);

  const httpPort = process.env.PORT || 3000;
  const grpcUrl = `0.0.0.0:${httpPort}`;

  console.log('🚀 Configuring gRPC at:', grpcUrl);

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

  // Health check endpoint para Railway
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'academy',
      grpc: 'available',
      grpc_url: grpcUrl,
      http_port: httpPort,
      packages: [
        'academy.courses.v1',
        'academy.roadmaps.v1',
        'academy.grading.v1',
      ],
      network: {
        mode: 'HTTP+gRPC_HYBRID',
        railway_internal: 'campus-api-academy.railway.internal',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // IMPORTANTE: Iniciar microservicios gRPC ANTES del servidor HTTP
  await app.startAllMicroservices();
  console.log('✅ gRPC microservices started successfully');

  // Iniciar servidor HTTP
  await app.listen(httpPort, '0.0.0.0');

  console.log(`🚀 Academy HTTP server running on port ${httpPort}`);
  console.log(`🚀 Academy gRPC microservice running on ${grpcUrl}`);
  console.log(
    `🛡️ Client origin validation: ${process.env.NODE_ENV === 'production' ? 'ENABLED' : 'DEVELOPMENT MODE'}`,
  );
  console.log(
    `📦 Packages: academy.courses.v1, academy.roadmaps.v1, academy.grading.v1`,
  );
  console.log(
    `🔒 Allowed clients: ${process.env.GATEWAY_SERVICE_NAME || 'campus-api-gateway'}`,
  );
  console.log(`🌐 Railway mode: HTTP+gRPC hybrid on port ${httpPort}`);
}

void bootstrap();
