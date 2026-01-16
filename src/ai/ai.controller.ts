import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AiTestDto } from './dto/ai-test.dto';
import { Auth } from '../users/decorators/auth.decorators';
import { UserRoles } from '../users/interfaces/user-roles.interface';
import { AI_PROVIDER_HEADER } from './ai.constants';
import { normalizeAiProvider } from './ai.utils';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  @Auth(UserRoles.ADMINISTRATOR, UserRoles.RESEARCHER)
  async health() {
    return this.aiService.getHealth();
  }

  @Post('test')
  @Auth(UserRoles.ADMINISTRATOR, UserRoles.RESEARCHER)
  async test(
    @Body() dto: AiTestDto,
    @Headers(AI_PROVIDER_HEADER) providerHeader?: string,
  ) {
    const providerOverride = normalizeAiProvider(providerHeader ?? dto.provider);
    const providerUsed = this.aiService.resolveProviderName(providerOverride);

    const start = Date.now();
    const output = await this.aiService.generateText(dto.prompt, {
      providerOverride,
    });
    const latencyMs = Date.now() - start;

    return {
      providerUsed,
      output,
      latencyMs,
    };
  }
}
