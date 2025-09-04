import { Injectable } from '@nestjs/common';
import Database from 'src/database/db';
import { GoogleEmbeddingService } from 'src/ai/gcp/google-embedding.service';

import { CursorUtils } from 'src/utils/CursorUtils';
import { toPgTuple } from 'src/utils/PgUtils';

// Import all DTOs
import { CourseDto } from './dto/courses/common/course.dto';
import { CourseEnrollmentDto } from './dto/courses/common/course-enrollment.dto';

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

// import { DeleteCourseRequestDto } from './dto/courses/requests/delete-course-request.dto';
// import { DeleteCourseResponseDto } from './dto/courses/responses/delete-course-response.dto';

import { EnrollStudentRequestDto } from './dto/courses/requests/enroll-student-request.dto';
import { EnrollStudentResponseDto } from './dto/courses/responses/enroll-student-response.dto';

import { GetCourseEnrollmentsRequestDto } from './dto/courses/requests/get-course-enrollments-request.dto';
import { GetCourseEnrollmentsResponseDto } from './dto/courses/responses/get-course-enrollments-response.dto';

import { SearchCourseWithAiReqDto } from './dto/courses/requests/get-course-with-ai-request.dto';
import { SearchCourseWithAiResDto } from './dto/courses/responses/search-course-with-ai-response.dto';

// AI
import { XavierMessage, XavierService } from 'src/ai/xavier/xavier.service';
import { prompts } from 'src/ai/xavier/prompts/prompts';

@Injectable()
export class CoursesService {
  private db: Database;
  private xavier: XavierService;

  constructor(private readonly googleEmbeddingService: GoogleEmbeddingService) {
    this.db = Database.getInstance();
    this.xavier = new XavierService();
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

      const embeddingContent: string[] = [
        courseName,
        courseSummary,
        courseDescription,
      ];

      const embedding = await this.googleEmbeddingService.getEmbedding(
        ...embeddingContent,
      );

      const courseTuple = toPgTuple(courseData);
      const componentTuple = `${componentsDataTuples.join(',')}`;
      const embeddingTuple = toPgTuple([
        embedding.model,
        embedding.dimension,
        `[${embedding.embedding.join(',')}]`,
        embedding.normalized,
      ]);

      const query = `
        SELECT create_course(
          ${courseTuple}::course_insert_data, 
          ARRAY[${componentTuple}]::component_insert_data[], 
          ${embeddingTuple}::embedding_insert_data
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

  async searchCourseWithAi(
    getCourseWithAiDto: SearchCourseWithAiReqDto,
  ): Promise<SearchCourseWithAiResDto> {
    try {
      const prompt = getCourseWithAiDto.messages.pop()?.content,
        embeddedPrompt = await this.googleEmbeddingService.getEmbedding(
          prompt!,
        ),
        embeddingArray = `[${embeddedPrompt.embedding.join(',')}]`,
        result = await this.db.query('ai.cosineSimilarity', [
          embeddingArray,
          5,
        ]);

      console.log(result.rows);

      type CosineSimilarityRow = { object_id: string };
      const coursesId = (result.rows as CosineSimilarityRow[]).map(
        (course) => course.object_id,
      );

      const completeCourses = await Promise.all(
        coursesId.map((id) => this.getCourseById({ courseId: id })),
      );

      console.log(completeCourses);

      const coursesInfo = completeCourses
        .filter((courseResponse) => courseResponse.course)
        .map((courseResponse) => {
          const course = courseResponse.course;
          return `**${course.courseName}**
                  Resumen: ${course.courseSummary}
                  Descripción: ${course.courseDescription || 'No disponible'}`;
        })
        .join('\n\n');

      const xavierMessages: XavierMessage[] = [
        {
          role: 'system',
          content: prompts.courses.searchCourseWithAi(prompt!, coursesInfo),
        },
        {
          role: 'user',
          content: prompt!,
        },
      ];

      const res = await this.xavier.chat(xavierMessages);
      return { response: res };
    } catch (error) {
      console.error('❌ Error finding course with AI assistance:', error);
      throw new Error(
        `Error finding course with AI assistance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getCourseById(
    getCourseByIdDto: GetCourseByIdRequestDto,
  ): Promise<GetCourseByIdResponseDto> {
    const { courseId } = getCourseByIdDto;

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
    getCoursesByInstitutionDto: GetCoursesByInstitutionRequestDto,
  ): Promise<GetCoursesByInstitutionResponseDto> {
    try {
      const { institutionId, cursor, limit } = getCoursesByInstitutionDto;

      let cursorTimestamp: string | null = null;
      let cursorCourseId: string | null = null;
      if (cursor) {
        try {
          const parsed = CursorUtils.parseCursor(cursor);
          cursorTimestamp =
            parsed.timestamp instanceof Date
              ? parsed.timestamp.toISOString()
              : parsed.timestamp;
          cursorCourseId = parsed.id;
        } catch (err) {
          console.error('❌ Error parsing cursor:', err);
          throw new Error('Invalid cursor');
        }
      }

      const result = await this.db.query('courses.getCoursesByInstitution', [
        institutionId,
        cursorTimestamp,
        cursorCourseId,
        limit + 1,
      ]);

      const courses: CourseDto[] = result.rows.map((course) => ({
        courseId: course.course_id,
        courseName: course.course_name,
        courseSummary: course.course_summary,
        courseDescription: course.course_description,
        institutionId: course.institution_id,
        courseImageId: course.course_image_id,
        createdAt: course.created_at,
      }));

      const { items, pageInfo } = CursorUtils.generatePageInfo(
        courses,
        limit,
        cursor,
      );

      return {
        courses: items,
        pageInfo,
      };
    } catch (error) {
      console.error('❌ Error finding courses by institution id:', error);
      throw new Error(
        `Error finding courses by institution id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getCourseByName(
    getCourseByNameDto: GetCourseByNameRequestDto,
  ): Promise<GetCourseByNameResponseDto> {
    try {
      const { courseName, institutionId, cursor, limit } = getCourseByNameDto;
      console.log(`🔍 Finding course by name: ${courseName}`);
      let cursorTimestamp: string | null = null;
      let cursorCourseId: string | null = null;
      if (cursor) {
        try {
          const parsed = CursorUtils.parseCursor(cursor);
          cursorTimestamp =
            parsed.timestamp instanceof Date
              ? parsed.timestamp.toISOString()
              : parsed.timestamp;
          cursorCourseId = parsed.id;
        } catch (err) {
          console.error('❌ Error parsing cursor:', err);
          throw new Error('Invalid cursor');
        }
      }

      const result = await this.db.query('courses.getCoursesByName', [
        institutionId,
        courseName,
        cursorTimestamp,
        cursorCourseId,
        limit + 1,
      ]);

      if (result.rowCount === 0) {
        console.log('❌ Course not found by name:', courseName);
        throw new Error('Course not found');
      }

      const courses = result.rows.map((row) => ({
        courseId: row.course_id,
        courseName: row.course_name,
        courseSummary: row.course_summary,
        courseImageId: row.course_image_id,
        createdAt: row.created_at,
      }));

      return { courses };
    } catch (error) {
      console.error('❌ Error finding course by name:', error);
      throw new Error(
        `Error finding course by name: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateCourse(
    updateCourseDto: UpdateCourseRequestDto,
  ): Promise<UpdateCourseResponseDto> {
    try {
      const {
        courseId,
        courseName,
        courseSummary,
        courseDescription,
        courseImageId,
      } = updateCourseDto;

      const result = await this.db.query('courses.updateCourse', [
        courseName ?? null,
        courseSummary ?? null,
        courseDescription ?? null,
        courseImageId ?? null,
        courseId,
      ]);

      if (result.rowCount === 0) {
        console.log('❌ Course not found for update:', courseId);
        throw new Error('Course not found');
      }

      return { course: result.rows[0] };
    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw new Error(
        `Error updating course: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async enrollStudent(
    enrollStudentDto: EnrollStudentRequestDto,
  ): Promise<EnrollStudentResponseDto> {
    try {
      const { courseId, campusUserId } = enrollStudentDto;

      const result = await this.db.query('courses.enrollStudent', [
        courseId,
        campusUserId,
      ]);

      if (result.rowCount === 0) {
        console.log('❌ Enrollment failed:', enrollStudentDto);
        throw new Error('Enrollment failed');
      }

      const enrollment: CourseEnrollmentDto = {
        courseEnrollmentId: result.rows[0].course_enrollment_id,
        courseId: result.rows[0].course_id,
        campusUserId: result.rows[0].campus_user_id,
        enrolledAt: result.rows[0].enrolled_at,
      };

      return { enrollment };
    } catch (error) {
      console.error('❌ Error enrolling student:', error);
      throw new Error(
        `Error enrolling student: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getCourseEnrollments(
    getCourseEnrollmentsDto: GetCourseEnrollmentsRequestDto,
  ): Promise<GetCourseEnrollmentsResponseDto> {
    try {
      const { courseId, cursor, limit } = getCourseEnrollmentsDto;
      console.log(`🔍 Finding course enrollments for courseId: ${courseId}`);
      let cursorTimestamp: string | null = null;
      let cursorEnrollmentId: string | null = null;
      if (cursor) {
        try {
          const parsed = CursorUtils.parseCursor(cursor);
          cursorTimestamp =
            parsed.timestamp instanceof Date
              ? parsed.timestamp.toISOString()
              : parsed.timestamp;
          cursorEnrollmentId = parsed.id;
        } catch (err) {
          console.error('❌ Error parsing cursor:', err);
          throw new Error('Invalid cursor');
        }
      }

      const result = await this.db.query('courses.getCourseEnrollments', [
        courseId,
        cursorTimestamp,
        cursorEnrollmentId,
        limit + 1,
      ]);

      const enrollments: CourseEnrollmentDto[] = result.rows.map((row) => ({
        courseEnrollmentId: row.course_enrollment_id,
        courseId: row.course_id,
        campusUserId: row.campus_user_id,
        enrolledAt: row.enrolled_at,
      }));

      const { items, pageInfo } = CursorUtils.generatePageInfo(
        enrollments,
        limit,
        cursor,
      );

      return {
        enrollments: items,
        pageInfo,
      };
    } catch (error) {
      console.error('❌ Error finding course enrollments:', error);
      throw new Error(
        `Error finding course enrollments: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
