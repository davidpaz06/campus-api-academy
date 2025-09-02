import { Injectable } from '@nestjs/common';
import { GoogleAuth } from 'google-auth-library';

@Injectable()
export class GoogleEmbeddingService {
  private client: any;
  private projectId: string;
  private location: string;
  private model: string;

  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID!;
    this.location = process.env.GCP_LOCATION || 'us-central1';
    this.model = process.env.GCP_MODEL || 'text-multilingual-embedding-002';
  }

  async init() {
    if (!this.client) {
      const auth = new GoogleAuth({
        keyFile: process.env.GCP_CREDENTIALS!,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      this.client = await auth.getClient();
    }
  }

  async getEmbedding(...texts: string[]): Promise<{
    model: string;
    dimension: number;
    embedding: number[];
    normalized: boolean;
  }> {
    await this.init();
    const content = texts.filter(Boolean).join(' ');
    const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:predict`;
    const body = { instances: [{ content }] };
    const res = await this.client.request({
      url,
      method: 'POST',
      data: body,
    });
    const valuesRaw = res.data?.predictions?.[0]?.embeddings?.values;
    if (!Array.isArray(valuesRaw) || valuesRaw.length !== 768) {
      throw new Error('Embedding values not found or invalid format');
    }
    const values: number[] = valuesRaw.map((v: any) => Number(v));

    const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
    const normalizedEmbedding =
      norm === 0 ? values : values.map((val) => val / norm);

    return {
      model: this.model,
      dimension: 768,
      embedding: normalizedEmbedding,
      normalized: true,
    };
  }
}
