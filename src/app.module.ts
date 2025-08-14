import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './modules/courses/courses.module';
import { RoadmapsModule } from './modules/roadmaps/roadmaps.module';
import { GradingModule } from './modules/grading/grading.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, CoursesModule, RoadmapsModule, GradingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
