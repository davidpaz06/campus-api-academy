import { Injectable } from '@nestjs/common';
import Database from 'src/database/db';
import { CursorUtils } from '../../utils/CursorUtils';

// Import all DTOs
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

import { DeleteCourseRequestDto } from './dto/courses/requests/delete-course-request.dto';
import { DeleteCourseResponseDto } from './dto/courses/responses/delete-course-response.dto';

import { EnrollStudentRequestDto } from './dto/courses/requests/enroll-student-request.dto';
import { EnrollStudentResponseDto } from './dto/courses/responses/enroll-student-response.dto';
import { GetCourseEnrollmentsRequestDto } from './dto/courses/requests/get-course-enrollments-request.dto';
import { GetCourseEnrollmentsResponseDto } from './dto/courses/responses/get-course-enrollments-response.dto';

@Injectable()
export class CoursesService {
  private db: Database;
  constructor() {
    this.db = Database.getInstance();
  }

  greeting(request: GreetingRequestDto): Promise<GreetingResponseDto> {
    const message = `¡Hola ${request.name}! Bienvenido al microservicio Academy 🎓`;

    return Promise.resolve({
      message,
    });
  }

  async createCourse(
    createCourseDto: CreateCourseRequestDto,
  ): Promise<CreateCourseResponseDto> {
    try {
      console.log('🚀 Creating course with data:', createCourseDto);

      const {
        courseName,
        courseSummary,
        courseDescription,
        institutionId,
        courseImageId,
        components,
      } = createCourseDto;

      // 1. Preparar los datos del curso para la función SQL
      const courseData = {
        course_name: courseName,
        course_summary: courseSummary,
        course_description: courseDescription || null,
        institution_id: institutionId,
        course_image_id: courseImageId || null,
      };

      // 2. Preparar los datos de los componentes para la función SQL
      const componentsData = components.map((comp) => ({
        component_name: comp.componentName,
        component_summary: comp.componentSummary,
        component_type_id: comp.componentTypeId,
        context_body: comp.contextBody || null,
        position: comp.position,
        file_id:
          comp.fileIds && comp.fileIds.length > 0 ? comp.fileIds[0] : null,
        parent_temp_id: comp.parentTempId || null,
        real_parent_id: comp.realParentId || null,
      }));

      console.log('📝 Course data prepared:', courseData);
      console.log(
        `🔧 Components data prepared with ${componentsData.length} components: ${JSON.stringify(componentsData)}`,
      );

      // 3. Llamar a la función SQL create_course
      const result = await this.db.query('courses.createCourse', [
        courseData,
        componentsData,
      ]);

      const newCourseId: string = result.rows[0].course_id;
      console.log('✅ Course created with ID:', newCourseId);

      // 4. Obtener el curso completo recién creado
      const completeCourse = await this.getCourseById(newCourseId);

      console.log('🎯 Course creation completed successfully');

      return {
        course: completeCourse.course,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Error creating course:', error);

        if (error.message?.includes('institution_id')) {
          throw new Error('Institution not found or invalid');
        }
        if (error.message?.includes('component_type_id')) {
          throw new Error('Invalid component type provided');
        }
        if (error.message?.includes('course_image_id')) {
          throw new Error('Course image file not found');
        }

        throw new Error(`Failed to create course: ${error.message}`);
      }
      throw new Error('Failed to create course: Unknown error');
    }
  }

  async getCourseById(id: string): Promise<GetCourseByIdResponseDto> {
    try {
      const courseResult = await this.db.query('courses.getCourseById', [id]);

      if (courseResult.rowCount === 0) {
        console.log('❌ Course not found by ID:', id);
        throw new Error('Course not found');
      }

      const componentsResult = await this.db.query(
        'courses.getCourseComponents',
        [id],
      );

      console.log(
        `🔍 Course found by id ${id} with ${componentsResult.rows.length} components`,
      );

      const course = {
        courseId: courseResult.rows[0].course_id,
        courseName: courseResult.rows[0].course_name,
        courseSummary: courseResult.rows[0].course_summary,
        courseDescription: courseResult.rows[0].course_description,
        institutionId: courseResult.rows[0].institution_id,
        courseImageId: courseResult.rows[0].course_image_id,
        createdAt: courseResult.rows[0].created_at,
        components: componentsResult.rows.map((comp) => ({
          componentId: comp.component_id,
          componentName: comp.component_name,
          componentSummary: comp.component_summary,
          contextBody: comp.context_body,
          componentTypeId: comp.component_type_id,
          position: comp.position,
          parentId: comp.parent_id,
          courseId: comp.course_id,
          fileIds: comp.file_ids,
        })),
      };

      return { course };
    } catch (error) {
      console.error('❌ Error finding course by id:', error);
      throw new Error(
        `Error finding course by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
