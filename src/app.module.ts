import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from './modules/.module';
import { CoursesModule } from './modules/courses/courses.module';

@Module({
  imports: [Module, CoursesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
