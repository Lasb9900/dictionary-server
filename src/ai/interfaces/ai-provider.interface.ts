export type AiProviderName = 'gemini' | 'ollama';

export interface AiGenerateInput {
  prompt: string;
  input?: string;
  temperature?: number;
  model?: string;
}

export interface AiProvider {
  name: AiProviderName;
  generateText(input: AiGenerateInput): Promise<string>;
  isConfigured(): boolean;
  isReachable?(): Promise<boolean>;
}
