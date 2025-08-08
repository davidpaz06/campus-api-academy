import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getProtoPath } from '@davidpaz06/shared';

async function bootstrap() {
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
        url: `${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 50051}`,
      },
    },
  );

  await app.listen();

  console.log(
    `🚀 Academy gRPC microservice running on ${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 50051}`,
  );
  console.log(
    `📦 Packages: academy.courses.v1, academy.roadmaps.v1, academy.grading.v1`,
  );
}
void bootstrap();
