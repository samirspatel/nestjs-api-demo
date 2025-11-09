import { Global, Module } from '@nestjs/common';
import { Logger } from 'common-sense-logger';

const logger = new Logger({
  serviceName: 'nestjs-api-demo',
});

@Global()
@Module({
  providers: [
    {
      provide: 'LOGGER',
      useValue: logger,
    },
  ],
  exports: ['LOGGER'],
})
export class LoggerModule {}
