import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_PROVIDERS } from './ai.constants';
import { Inject } from '@nestjs/common';
import {
  AiGenerateInput,
  AiProvider,
  AiProviderName,
} from './interfaces/ai-provider.interface';
import { OllamaProvider } from './providers/ollama.provider';

export interface AiGenerateOptions {
  providerOverride?: AiProviderName;
  temperature?: number;
  model?: string;
}

@Injectable()
export class AiService {
  private readonly providerMap: Map<AiProviderName, AiProvider>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(AI_PROVIDERS) providers: AiProvider[],
    private readonly ollamaProvider: OllamaProvider,
  ) {
    this.providerMap = new Map(
      providers.map((provider) => [provider.name, provider]),
    );
  }

  getDefaultProviderName(): AiProviderName {
    const configured = this.configService
      .get<string>('aiProvider', 'ollama')
      .toLowerCase();

    if (configured === 'gemini' || configured === 'ollama') {
      return configured;
    }

    return 'ollama';
  }

  resolveProviderName(
    providerOverride?: AiProviderName,
  ): AiProviderName {
    return providerOverride ?? this.getDefaultProviderName();
  }

  async generateText(
    prompt: string,
    options: AiGenerateOptions = {},
  ): Promise<{
    output: string;
    providerUsed: AiProviderName;
    latencyMs: number;
  }> {
    const providerName = this.resolveProviderName(options.providerOverride);
    const start = Date.now();

    if (this.configService.get('aiTestMode')) {
      const output = `[ai-test:${providerName}] ${prompt}`;
      return {
        output,
        providerUsed: providerName,
        latencyMs: Date.now() - start,
      };
    }

    const provider = this.providerMap.get(providerName);

    if (!provider) {
      throw new BadRequestException(`Unsupported AI provider: ${providerName}`);
    }

    await this.ensureProviderAvailable(
      providerName,
      Boolean(options.providerOverride),
    );

    const input: AiGenerateInput = {
      prompt,
      model: options.model,
      temperature: options.temperature,
    };

    const output = await provider.generateText(input);
    return {
      output,
      providerUsed: providerName,
      latencyMs: Date.now() - start,
    };
  }

  async getHealth() {
    const defaultProvider = this.getDefaultProviderName();
    const geminiProvider = this.providerMap.get('gemini');
    const ollamaProvider = this.providerMap.get('ollama');

    const geminiConfigured = geminiProvider?.isConfigured() ?? false;
    const ollamaConfigured = ollamaProvider?.isConfigured() ?? false;
    const inTestMode = Boolean(this.configService.get('aiTestMode'));
    const ollamaReachable =
      !inTestMode && ollamaConfigured
        ? await this.ollamaProvider.isReachable()
        : false;

    return {
      defaultProvider,
      geminiConfigured,
      ollamaConfigured,
      ollamaReachable,
      timestamp: new Date().toISOString(),
    };
  }

  private async ensureProviderAvailable(
    providerName: AiProviderName,
    isOverride: boolean,
  ) {
    if (providerName === 'gemini') {
      const apiKey = this.configService.get<string>('geminiApiKey');
      if (!apiKey) {
        throw new BadRequestException('GEMINI_API_KEY is not configured.');
      }
      return;
    }

    if (!isOverride) {
      return;
    }

    const baseUrl = this.configService.get<string>('ollamaBaseUrl');
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'OLLAMA_BASE_URL is not configured.',
      );
    }

    const reachable = await this.ollamaProvider.isReachable();
    if (!reachable) {
      throw new BadGatewayException(
        'Ollama is not reachable at OLLAMA_BASE_URL.',
      );
    }
  }
}
