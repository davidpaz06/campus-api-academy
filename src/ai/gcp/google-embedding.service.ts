import { Injectable } from '@nestjs/common';
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';
import * as fs from 'fs';

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
    if (process.env.NODE_ENV === 'production') {
      // En Railway, usar variables individuales
      return {
        type: 'service_account',
        project_id: process.env.GCP_PROJECT_ID || '',
        private_key_id: process.env.GCP_PRIVATE_KEY_ID || '',
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        client_email: process.env.GCP_CLIENT_EMAIL || '',
        client_id: process.env.GCP_CLIENT_ID || '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GCP_CLIENT_X509_CERT_URL || '',
        universe_domain: 'googleapis.com',
      };
    } else {
      // En desarrollo, usar archivo local de forma segura
      try {
        const credentialsPath = path.resolve(
          __dirname,
          '../../vertical-task-455721-e5-bdeefcfe2c8b.json',
        );
        const credentialsFile = fs.readFileSync(credentialsPath, 'utf8');
        return JSON.parse(credentialsFile) as Record<string, string>;
      } catch (error) {
        console.error('Error loading GCP credentials file:', error);
        throw new Error('GCP credentials file not found or invalid');
      }
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
