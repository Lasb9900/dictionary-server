import { AiService } from './ai.service';
import { AiProvider } from './interfaces/ai-provider.interface';

describe('AiService fallback behavior', () => {
  const createConfigService = (overrides: Record<string, any> = {}) => ({
    get: (key: string, defaultValue?: any) => {
      if (key in overrides) {
        return overrides[key];
      }
      return defaultValue;
    },
  });

  it('falls back to ollama when gemini fails', async () => {
    const geminiProvider: AiProvider = {
      name: 'gemini',
      isConfigured: () => true,
      generateText: jest.fn().mockRejectedValue(new Error('gemini down')),
      embedText: jest.fn().mockResolvedValue([0.1, 0.2]),
    };

    const ollamaProvider: AiProvider = {
      name: 'ollama',
      isConfigured: () => true,
      generateText: jest.fn().mockResolvedValue('ok'),
      embedText: jest.fn().mockResolvedValue([0.3, 0.4]),
    };

    const aiService = new AiService(
      createConfigService({
        aiProvider: 'gemini',
        geminiApiKey: 'key',
        ollamaBaseUrl: 'http://localhost:11434',
      }) as any,
      [geminiProvider, ollamaProvider],
      { isReachable: jest.fn().mockResolvedValue(true) } as any,
    );

    const result = await aiService.generateWithFallback('test');
    expect(result.providerUsed).toBe('ollama');
    expect(result.output).toBe('ok');
    expect(geminiProvider.generateText).toHaveBeenCalled();
    expect(ollamaProvider.generateText).toHaveBeenCalled();
  });

  it('returns null embedding when both providers fail', async () => {
    const geminiProvider: AiProvider = {
      name: 'gemini',
      isConfigured: () => true,
      generateText: jest.fn().mockResolvedValue('ok'),
      embedText: jest.fn().mockRejectedValue(new Error('gemini fail')),
    };

    const ollamaProvider: AiProvider = {
      name: 'ollama',
      isConfigured: () => true,
      generateText: jest.fn().mockResolvedValue('ok'),
      embedText: jest.fn().mockRejectedValue(new Error('ollama fail')),
    };

    const aiService = new AiService(
      createConfigService({
        aiProvider: 'gemini',
        geminiApiKey: 'key',
        ollamaBaseUrl: 'http://localhost:11434',
      }) as any,
      [geminiProvider, ollamaProvider],
      { isReachable: jest.fn().mockResolvedValue(true) } as any,
    );

    const result = await aiService.embed('texto');
    expect(result.vector).toBeNull();
  });
});
