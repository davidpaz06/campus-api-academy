import { Injectable } from '@nestjs/common';
import {
  GreetingRequest,
  GreetingResponse,
} from 'src/grpc/interfaces/academy.interface';
import { GetCourseByIdRequestDto } from './dto/courses/requests/get-course-by-id-request.dto';
import { GetCourseByIdResponseDto } from './dto/courses/responses/get-course-by-id-response.dto';

@Injectable()
export class CoursesService {
  greeting(request: GreetingRequest): Promise<GreetingResponse> {
    const message = `¡Hola ${request.name}! Bienvenido al microservicio Academy 🎓`;

    return Promise.resolve({
      message,
    });
  }

  async getCourseById(
    request: GetCourseByIdRequestDto,
  ): Promise<GetCourseByIdResponseDto> {
    console.log('data received:', request);
    console.log(`Returning course with ID: ${request.courseId}`);

    return Promise.resolve({
      id: request.courseId,
      name: 'Curso de NestJS',
      description: 'Aprende los fundamentos de NestJS',
    });
  }
}
