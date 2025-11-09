import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const now = Date.now();

    this.logger.debug(
      `Incoming request: ${method} ${url}`,
      'HTTP_REQUEST',
      {
        method,
        url,
        query,
        params,
        body: method !== 'GET' ? body : undefined,
      },
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          const response = context.switchToHttp().getResponse();
          this.logger.logHttpRequest(
            method,
            url,
            response.statusCode,
            responseTime,
          );
          this.logger.debug(
            `Request completed successfully`,
            'HTTP_RESPONSE',
            {
              method,
              url,
              responseTime: `${responseTime}ms`,
              dataSize: JSON.stringify(data).length,
            },
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Request failed: ${method} ${url}`,
            error.stack,
            'HTTP_ERROR',
            {
              method,
              url,
              statusCode: error.status || 500,
              responseTime: `${responseTime}ms`,
              errorMessage: error.message,
            },
          );
        },
      }),
    );
  }
}

