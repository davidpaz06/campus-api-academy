import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { GoogleEmbeddingService } from 'src/ai/gcp/google-embedding.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, GoogleEmbeddingService],
})
export class CoursesModule {}
