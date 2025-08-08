import { Controller } from '@nestjs/common';
import { GradingService } from './grading.service';

@Controller()
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}
}
