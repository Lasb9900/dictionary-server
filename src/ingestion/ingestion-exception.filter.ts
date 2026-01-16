import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { buildHttpErrorPayload } from '../common/filters/http-exception.filter';

@Catch()
export class IngestionExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const payload = buildHttpErrorPayload(exception);

    response.status(payload.statusCode).json({
      ok: false,
      message: payload.message,
      statusCode: payload.statusCode,
      error: payload.error,
    });
  }
}
