import { Module } from '@nestjs/common';
import { GoogleEmbeddingService } from './google-embedding.service';

@Module({
  providers: [GoogleEmbeddingService],
  exports: [GoogleEmbeddingService],
})
export class GoogleEmbeddingModule {}
