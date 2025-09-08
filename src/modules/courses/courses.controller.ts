import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CoursesService } from './courses.service';

import { GreetingRequestDto } from './dto/courses/requests/greeting-request.dto';
import { GreetingResponseDto } from './dto/courses/responses/greeting-response.dto';

import { CreateCourseRequestDto } from './dto/courses/requests/create-course-request.dto';
import { CreateCourseResponseDto } from './dto/courses/responses/create-course-response.dto';

import { GetCourseByIdRequestDto } from './dto/courses/requests/get-course-by-id-request.dto';
import { GetCourseByIdResponseDto } from './dto/courses/responses/get-course-by-id-response.dto';

import { GetCoursesByInstitutionRequestDto } from './dto/courses/requests/get-courses-by-institution-request.dto';
import { GetCoursesByInstitutionResponseDto } from './dto/courses/responses/get-courses-by-institution-response.dto';

import { GetCourseByNameRequestDto } from './dto/courses/requests/get-course-by-name-request.dto';
import { GetCourseByNameResponseDto } from './dto/courses/responses/get-course-by-name-response.dto';

import { UpdateCourseRequestDto } from './dto/courses/requests/update-course-request.dto';
import { UpdateCourseResponseDto } from './dto/courses/responses/update-course-response.dto';

import { EnrollStudentRequestDto } from './dto/courses/requests/enroll-student-request.dto';
import { EnrollStudentResponseDto } from './dto/courses/responses/enroll-student-response.dto';

import { GetCourseEnrollmentsRequestDto } from './dto/courses/requests/get-course-enrollments-request.dto';
import { GetCourseEnrollmentsResponseDto } from './dto/courses/responses/get-course-enrollments-response.dto';

import { SearchCourseWithAiReqDto } from './dto/courses/requests/search-course-with-ai-request.dto';
import { SearchCourseWithAiResDto } from './dto/courses/responses/search-course-with-ai-response.dto';

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

  @GrpcMethod('CoursesService', 'SearchCourseWithAi')
  async searchCourseWithAi(
    getCourseWithAiDto: SearchCourseWithAiReqDto,
  ): Promise<SearchCourseWithAiResDto> {
    console.log(
      '🎯 Academy service received gRPC request for SearchCourseWithAi',
    );
    console.log(
      '📨 Request data:',
      JSON.stringify(getCourseWithAiDto, null, 2),
    );
    console.log('🔍 Request type:', typeof getCourseWithAiDto);
    console.log('🔍 Request keys:', Object.keys(getCourseWithAiDto || {}));

    try {
      const result =
        await this.coursesService.searchCourseWithAi(getCourseWithAiDto);
      console.log('✅ Academy service successfully processed request');
      console.log('📤 Response:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ Academy service error processing request:', error);
      throw error;
    }
  }

  @GrpcMethod('CoursesService', 'GetCourseById')
  async getCourseById(
    getCourseByIdDto: GetCourseByIdRequestDto,
  ): Promise<GetCourseByIdResponseDto> {
    return await this.coursesService.getCourseById(getCourseByIdDto);
  }

  @GrpcMethod('CoursesService', 'GetCoursesByInstitution')
  async getCoursesByInstitution(
    getCoursesByInstitutionDto: GetCoursesByInstitutionRequestDto,
  ): Promise<GetCoursesByInstitutionResponseDto> {
    return await this.coursesService.getCoursesByInstitution(
      getCoursesByInstitutionDto,
    );
  }

  @GrpcMethod('CoursesService', 'GetCourseByName')
  async getCourseByName(
    getCourseByNameDto: GetCourseByNameRequestDto,
  ): Promise<GetCourseByNameResponseDto> {
    console.log('getCourseByNameDto', getCourseByNameDto);
    return await this.coursesService.getCourseByName(getCourseByNameDto);
  }

  @GrpcMethod('CoursesService', 'UpdateCourse')
  async updateCourse(
    updateCourseDto: UpdateCourseRequestDto,
  ): Promise<UpdateCourseResponseDto> {
    return await this.coursesService.updateCourse(updateCourseDto);
  }

  @GrpcMethod('CoursesService', 'EnrollStudent')
  async enrollStudent(
    enrollStudentDto: EnrollStudentRequestDto,
  ): Promise<EnrollStudentResponseDto> {
    console.log('service: controller enrollStudentDto', enrollStudentDto);
    return await this.coursesService.enrollStudent(enrollStudentDto);
  }

  @GrpcMethod('CoursesService', 'GetCourseEnrollments')
  async getCourseEnrollments(
    getCourseEnrollmentsDto: GetCourseEnrollmentsRequestDto,
  ): Promise<GetCourseEnrollmentsResponseDto> {
    return await this.coursesService.getCourseEnrollments(
      getCourseEnrollmentsDto,
    );
  }
}
