import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './modules/courses/courses.module';
import { RoadmapsModule } from './modules/roadmaps/roadmaps.module';
import { GradingModule } from './modules/grading/grading.module';

@Module({
  imports: [CoursesModule, RoadmapsModule, GradingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
