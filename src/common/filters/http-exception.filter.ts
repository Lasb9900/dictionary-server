import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

type ErrorPayload = {
  statusCode: number;
  message: string;
  error?: string;
};

const normalizeMessage = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object' && 'message' in value) {
    return normalizeMessage((value as { message?: unknown }).message) || '';
  }
  return '';
};

const buildErrorPayload = (exception: unknown): ErrorPayload => {
  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();
    const message = normalizeMessage(response) || exception.message;
    const error =
      typeof response === 'object' && response && 'error' in response
        ? String((response as { error?: string }).error)
        : exception.name;

    return {
      statusCode,
      message,
      error,
    };
  }

  if (exception instanceof Error) {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message || 'Internal server error',
      error: exception.name || 'Internal Server Error',
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    error: 'Internal Server Error',
  };
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const payload = buildErrorPayload(exception);

    response.status(payload.statusCode).json(payload);
  }
}

export const buildHttpErrorPayload = buildErrorPayload;
