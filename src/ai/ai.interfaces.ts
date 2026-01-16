export interface TextGenerationProvider {
  generateText(prompt: string): Promise<string>;
}
