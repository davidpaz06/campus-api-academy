import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getProtoPath } from '@davidpaz06/shared';

async function bootstrap() {
  // Crear microservicio gRPC puro
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
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
    },
  );

  // Iniciar microservicio gRPC
  await app.listen();

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
