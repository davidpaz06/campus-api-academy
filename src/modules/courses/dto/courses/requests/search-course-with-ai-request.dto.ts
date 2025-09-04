export class SearchCourseWithAiReqDto {
  messages!: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}
