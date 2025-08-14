import { Injectable } from '@nestjs/common';
import Database from 'src/database/db';

import { CursorUtils } from 'src/utils/CursorUtils';
import { toPgTuple } from 'src/utils/PgUtils';

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
      const {
        courseName,
        courseSummary,
        courseDescription,
        institutionId,
        courseImageId,
        components,
      } = createCourseDto;

      const courseData = [
        courseName,
        courseSummary,
        courseDescription || null,
        institutionId,
        courseImageId || null,
      ];

      const componentsDataTuples = components.map((comp) =>
        toPgTuple([
          comp.componentName,
          comp.componentSummary,
          comp.componentTypeId,
          comp.contextBody || null,
          comp.position,
          comp.fileIds && comp.fileIds.length > 0 ? comp.fileIds[0] : null,
          comp.parentTempId || null,
          comp.realParentId || null,
        ]),
      );

      const courseTuple = toPgTuple(courseData);
      const componentTuple = `${componentsDataTuples.join(',')}`;

      const query = `
        SELECT create_course(
          ${courseTuple}::course_insert_data, ARRAY[
          ${componentTuple}]::component_insert_data[]
        ) AS course_id
      `;

      const result = await this.db.query(query);

      console.log(result.rows[0]);

      const newCourseId: GetCourseByIdRequestDto = {
        courseId: result.rows[0].course_id,
      };
      console.log('✅ Course created with ID:', newCourseId);

      const completeCourse = await this.getCourseById(newCourseId);

      console.log('🎯 Course creation completed successfully');

      return completeCourse;
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

  async getCourseById(
    getCourseById: GetCourseByIdRequestDto,
  ): Promise<GetCourseByIdResponseDto> {
    const { courseId } = getCourseById;

    console.log(`🔍 Finding course by id: ${courseId}`);
    try {
      const courseResult = await this.db.query('courses.getCourseById', [
        courseId,
      ]);

      if (courseResult.rowCount === 0) {
        console.log('❌ Course not found by ID:', courseId);
        throw new Error('Course not found');
      }

      const componentsResult = await this.db.query(
        'courses.getCourseComponents',
        [courseId],
      );

      console.log(
        `🔍 Course found by id ${courseId} with ${componentsResult.rows.length} components`,
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

  async getCoursesByInstitution(
    institutionId: string,
  ): Promise<GetCoursesByInstitutionResponseDto> {
    console.log(`🔍 Finding courses by institution id: ${institutionId}`);
    try {
      const result = await this.db.query('courses.getCoursesByInstitution', [
        institutionId,
      ]);
      return { courses: result.rows };
    } catch (error) {
      console.error('❌ Error finding courses by institution id:', error);
      throw new Error(
        `Error finding courses by institution id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
