import { Observable } from 'rxjs';

import { GreetingRequestDto } from './courses/requests/greeting-request.dto';
import { GreetingResponseDto } from './courses/responses/greeting-response.dto';
import { GetCourseByIdRequestDto } from './courses/requests/get-course-by-id-request.dto';
import { GetCourseByIdResponseDto } from './courses/responses/get-course-by-id-response.dto';

export interface AcademyService {
  // Courses methods
  greeting(data: GreetingRequestDto): Observable<GreetingResponseDto>;
  getCourseById(
    data: GetCourseByIdRequestDto,
  ): Observable<GetCourseByIdResponseDto>;

  // // Grading methods
  // getGrade(data: GetGradeRequest): Observable<GradeResponse>;

  // // Roadmaps methods
  // getRoadmap(data: GetRoadmapRequest): Observable<RoadmapResponse>;
}
