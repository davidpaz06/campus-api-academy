import { Module } from '@nestjs/common';
import { XavierService } from './xavier.service';

@Module({
  providers: [XavierService],
  exports: [XavierService],
})
export class XavierModule {}
