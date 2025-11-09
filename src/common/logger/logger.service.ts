import { Injectable } from '@nestjs/common';
// Import common-sense-logger - try different import patterns
let LoggerClass: any;
try {
  LoggerClass = require('common-sense-logger').Logger || require('common-sense-logger').default || require('common-sense-logger');
} catch (e) {
  LoggerClass = null;
}

@Injectable()
export class LoggerService {
  private loggerInstance: any;

  constructor() {
    // Initialize the logger instance if available
    if (LoggerClass) {
      try {
        this.loggerInstance = typeof LoggerClass === 'function' ? new LoggerClass() : LoggerClass;
      } catch (e) {
        this.loggerInstance = null;
      }
    } else {
      this.loggerInstance = null;
    }
  }

  /**
   * Log informational messages
   * Use for general operational messages
   */
  info(message: string, context?: string, metadata?: any): void {
    const logMessage = context ? `[${context}] ${message}` : message;
    if (this.loggerInstance && typeof this.loggerInstance.info === 'function') {
      try {
        if (metadata) {
          this.loggerInstance.info(logMessage, metadata);
        } else {
          this.loggerInstance.info(logMessage);
        }
      } catch (error) {
        console.log(`[INFO] ${logMessage}`, metadata || '');
      }
    } else {
      console.log(`[INFO] ${logMessage}`, metadata || '');
    }
  }

  /**
   * Log error messages
   * Use for error events that might still allow the application to continue
   */
  error(message: string, trace?: string, context?: string, metadata?: any): void {
    const logMessage = context ? `[${context}] ${message}` : message;
    if (this.loggerInstance && typeof this.loggerInstance.error === 'function') {
      try {
        if (trace) {
          this.loggerInstance.error(logMessage, trace);
        } else if (metadata) {
          this.loggerInstance.error(logMessage, metadata);
        } else {
          this.loggerInstance.error(logMessage);
        }
      } catch (error) {
        console.error(`[ERROR] ${logMessage}`, { trace, ...metadata });
      }
    } else {
      console.error(`[ERROR] ${logMessage}`, { trace, ...metadata });
    }
  }

  /**
   * Log warning messages
   * Use for unexpected situations or problems in the near future
   */
  warn(message: string, context?: string, metadata?: any): void {
    const logMessage = context ? `[${context}] ${message}` : message;
    if (this.loggerInstance && typeof this.loggerInstance.warn === 'function') {
      try {
        if (metadata) {
          this.loggerInstance.warn(logMessage, metadata);
        } else {
          this.loggerInstance.warn(logMessage);
        }
      } catch (error) {
        console.warn(`[WARN] ${logMessage}`, metadata || '');
      }
    } else {
      console.warn(`[WARN] ${logMessage}`, metadata || '');
    }
  }

  /**
   * Log debug messages
   * Use for detailed information, typically when diagnosing problems
   */
  debug(message: string, context?: string, metadata?: any): void {
    const logMessage = context ? `[${context}] ${message}` : message;
    if (this.loggerInstance && typeof this.loggerInstance.debug === 'function') {
      try {
        if (metadata) {
          this.loggerInstance.debug(logMessage, metadata);
        } else {
          this.loggerInstance.debug(logMessage);
        }
      } catch (error) {
        console.debug(`[DEBUG] ${logMessage}`, metadata || '');
      }
    } else {
      console.debug(`[DEBUG] ${logMessage}`, metadata || '');
    }
  }

  /**
   * Log verbose messages
   * Use for very detailed information
   */
  verbose(message: string, context?: string, metadata?: any): void {
    const logMessage = context ? `[${context}] ${message}` : message;
    if (this.loggerInstance && typeof this.loggerInstance.verbose === 'function') {
      try {
        if (metadata) {
          this.loggerInstance.verbose(logMessage, metadata);
        } else {
          this.loggerInstance.verbose(logMessage);
        }
      } catch (error) {
        console.log(`[VERBOSE] ${logMessage}`, metadata || '');
      }
    } else if (this.loggerInstance && typeof this.loggerInstance.debug === 'function') {
      // Fallback to debug if verbose is not available
      try {
        if (metadata) {
          this.loggerInstance.debug(logMessage, metadata);
        } else {
          this.loggerInstance.debug(logMessage);
        }
      } catch (error) {
        console.log(`[VERBOSE] ${logMessage}`, metadata || '');
      }
    } else {
      console.log(`[VERBOSE] ${logMessage}`, metadata || '');
    }
  }

  /**
   * Log HTTP request information
   */
  logHttpRequest(method: string, url: string, statusCode: number, responseTime?: number): void {
    this.info(`${method} ${url} - ${statusCode}`, 'HTTP', {
      method,
      url,
      statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
    });
  }

  /**
   * Log database operations
   */
  logDatabaseOperation(operation: string, table: string, metadata?: any): void {
    this.debug(`Database ${operation} on ${table}`, 'DATABASE', metadata);
  }

  /**
   * Log business logic events
   */
  logBusinessEvent(event: string, details?: any): void {
    this.info(`Business event: ${event}`, 'BUSINESS', details);
  }
}

