import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

export type XavierMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class XavierService {
  private HF_TOKEN: string | undefined;
  private MODEL: string;
  private client: OpenAI;

  constructor() {
    this.HF_TOKEN = process.env.HF_TOKEN;
    this.MODEL = process.env.XAVIER_MODEL || 'openai/gpt-oss-120b:novita';
    this.client = new OpenAI({
      apiKey: this.HF_TOKEN,
      baseURL: 'https://router.huggingface.co/v1',
    });
  }

  async chat(messages: XavierMessage[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.MODEL,
        messages,
      });
      const content = response.choices?.[0]?.message?.content;

      console.log('Xavier service - response: ', content);
      return typeof content === 'string' ? content : '';
    } catch (error) {
      console.error('Error in chat:', error);
      return 'Error';
    }
  }
}
