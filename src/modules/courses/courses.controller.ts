import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CoursesService } from './courses.service';

import { GreetingRequestDto } from './dto/courses/requests/greeting-request.dto';
import { GreetingResponseDto } from './dto/courses/responses/greeting-response.dto';
import { GetCourseByIdRequestDto } from './dto/courses/requests/get-course-by-id-request.dto';
import { GetCourseByIdResponseDto } from './dto/courses/responses/get-course-by-id-response.dto';

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @GrpcMethod('CoursesService', 'Greeting')
  async greeting(data: GreetingRequestDto): Promise<GreetingResponseDto> {
    return await this.coursesService.greeting(data);
  }

  @GrpcMethod('CoursesService', 'GetCourseById')
  async getCourseById(
    data: GetCourseByIdRequestDto,
  ): Promise<GetCourseByIdResponseDto> {
    console.log('data received:', data);
    return await this.coursesService.getCourseById(data);
  }
}
