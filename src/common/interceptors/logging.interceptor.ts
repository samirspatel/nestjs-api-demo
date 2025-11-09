import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from 'common-sense-logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject('LOGGER') private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const now = Date.now();

    this.logger.debug(`[HTTP_REQUEST] Incoming request: ${method} ${url}`, {
      method,
      url,
      query,
      params,
      body: method !== 'GET' ? body : undefined,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          const response = context.switchToHttp().getResponse();
          this.logger.info(`[HTTP] ${method} ${url} - ${response.statusCode}`, {
            method,
            url,
            statusCode: response.statusCode,
            responseTime: `${responseTime}ms`,
          });
          this.logger.debug(`[HTTP_RESPONSE] Request completed successfully`, {
            method,
            url,
            responseTime: `${responseTime}ms`,
            dataSize: JSON.stringify(data).length,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(`[HTTP_ERROR] Request failed: ${method} ${url}`, {
            method,
            url,
            statusCode: error.status || 500,
            responseTime: `${responseTime}ms`,
            errorMessage: error.message,
            stack: error.stack,
          });
        },
      }),
    );
  }
}

