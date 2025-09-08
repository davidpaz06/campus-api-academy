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

  const grpcUrl = `${process.env.HOST || '0.0.0.0'}:${process.env.GRPC_PORT || 50051}`;
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
      url: `${process.env.HOST || '0.0.0.0'}:${process.env.GRPC_PORT || 50051}`,
    },
  });

  // Health check endpoint para Railway
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'academy',
      grpc: 'available',
      packages: [
        'academy.courses.v1',
        'academy.roadmaps.v1',
        'academy.grading.v1',
      ],
      timestamp: new Date().toISOString(),
    });
  });

  // Iniciar microservicios gRPC
  await app.startAllMicroservices();

  // Iniciar servidor HTTP para health checks
  const httpPort = process.env.PORT || 3000;
  await app.listen(httpPort, '0.0.0.0');

  console.log(`🚀 Academy HTTP server running on port ${httpPort}`);
  console.log(
    `🚀 Academy gRPC microservice running on ${process.env.HOST || '0.0.0.0'}:${process.env.GRPC_PORT || 50051}`,
  );
  console.log(
    `🛡️ Client origin validation: ${process.env.NODE_ENV === 'production' ? 'ENABLED' : 'DEVELOPMENT MODE'}`,
  );
  console.log(
    `📦 Packages: academy.courses.v1, academy.roadmaps.v1, academy.grading.v1`,
  );
  console.log(
    `🔒 Allowed clients: ${process.env.GATEWAY_SERVICE_NAME || 'campus-api-gateway'}`,
  );

  if (process.env.GATEWAY_IP) {
    console.log(`🌐 Allowed Gateway IP: ${process.env.GATEWAY_IP}`);
  }
}
void bootstrap();
