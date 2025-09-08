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
        credentials: this.getCredentials(),
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      this.client = await auth.getClient();
    }
  }

  private getCredentials(): Record<string, string> {
    // Verificar que todas las variables necesarias estén disponibles
    const requiredVars = [
      'GCP_PROJECT_ID',
      'GCP_PRIVATE_KEY_ID',
      'GCP_PRIVATE_KEY',
      'GCP_CLIENT_EMAIL',
      'GCP_CLIENT_ID',
      'GCP_CLIENT_X509_CERT_URL',
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing GCP environment variables: ${missingVars.join(', ')}`,
      );
    }

    return {
      type: 'service_account',
      project_id: process.env.GCP_PROJECT_ID!,
      private_key_id: process.env.GCP_PRIVATE_KEY_ID!,
      private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      client_email: process.env.GCP_CLIENT_EMAIL!,
      client_id: process.env.GCP_CLIENT_ID!,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GCP_CLIENT_X509_CERT_URL!,
      universe_domain: 'googleapis.com',
    };
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
