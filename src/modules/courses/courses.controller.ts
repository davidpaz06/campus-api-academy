import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CoursesService } from './courses.service';

import { GreetingRequestDto } from './dto/courses/requests/greeting-request.dto';
import { GreetingResponseDto } from './dto/courses/responses/greeting-response.dto';
import { GetCourseByIdResponseDto } from './dto/courses/responses/get-course-by-id-response.dto';
import { CreateCourseRequestDto } from './dto/courses/requests/create-course-request.dto';
import { CreateCourseResponseDto } from './dto/courses/responses/create-course-response.dto';
import { GetCourseByIdRequestDto } from './dto/courses/requests/get-course-by-id-request.dto';

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @GrpcMethod('CoursesService', 'Greeting')
  async greeting(data: GreetingRequestDto): Promise<GreetingResponseDto> {
    return await this.coursesService.greeting(data);
  }

  @GrpcMethod('CoursesService', 'CreateCourse')
  async createCourse(
    createCourseDto: CreateCourseRequestDto,
  ): Promise<CreateCourseResponseDto> {
    return await this.coursesService.createCourse(createCourseDto);
  }

  @GrpcMethod('CoursesService', 'GetCourseById')
  async getCourseById(
    getCourseByIdDto: GetCourseByIdRequestDto,
  ): Promise<GetCourseByIdResponseDto> {
    console.log('getCourseByIdDto', getCourseByIdDto);
    return await this.coursesService.getCourseById(getCourseByIdDto);
  }
}
