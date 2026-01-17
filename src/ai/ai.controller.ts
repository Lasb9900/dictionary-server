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
    const result = await this.aiService.generateWithFallback(dto.prompt, {
      providerOverride,
    });

    return {
      providerUsed: result.providerUsed,
      output: result.output,
      latencyMs: result.latencyMs,
    };
  }
}
