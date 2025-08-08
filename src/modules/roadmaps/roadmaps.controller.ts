import { Controller } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';

@Controller()
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}
}
