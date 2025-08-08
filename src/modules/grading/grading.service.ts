import { Injectable } from '@nestjs/common';

@Injectable()
export class GradingService {
  async greetFromGrading(name: string): Promise<string> {
    return Promise.resolve(
      `¡Hola ${name}! Bienvenido al microservicio Grading 📚`,
    );
  }
}
