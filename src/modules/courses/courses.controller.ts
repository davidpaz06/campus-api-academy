import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @MessagePattern('createCourse')
  create(@Payload() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @MessagePattern('findAllCourses')
  findAll() {
    return this.coursesService.findAll();
  }

  @MessagePattern('findOneCourse')
  findOne(@Payload() id: number) {
    return this.coursesService.findOne(id);
  }

  @MessagePattern('updateCourse')
  update(@Payload() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(updateCourseDto.id, updateCourseDto);
  }

  @MessagePattern('removeCourse')
  remove(@Payload() id: number) {
    return this.coursesService.remove(id);
  }
}
