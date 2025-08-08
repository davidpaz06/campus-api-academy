export interface GreetingRequest {
  name: string;
}

export interface GreetingResponse {
  message: string;
}

export interface GetCoursesRequest {
  institutionId: string;
  page: number;
  limit: number;
}

export interface GetCoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

export interface GetCourseByIdRequest {
  courseId: string;
}

export interface Course {
  courseId: string;
  courseName: string;
  courseDescription: string;
  instructorId: string;
  institutionId: string;
  credits: number;
  createdAt: string;
  isActive: boolean;
}

export interface CreateCourseRequest {
  courseName: string;
  courseDescription: string;
  instructorId: string;
  institutionId: string;
  credits: number;
}

export interface EnrollStudentRequest {
  studentId: string;
  courseId: string;
}

export interface EnrollmentResponse {
  enrollmentId: string;
  success: boolean;
  message: string;
}

export interface GetEnrollmentsRequest {
  studentId: string;
}

export interface GetEnrollmentsResponse {
  enrollments: Enrollment[];
}

export interface Enrollment {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  status: string;
}
