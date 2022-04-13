import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { WordlesModule } from './wordles/wordles.module';

@Module({ imports: [WordlesModule], providers: [{ provide: APP_PIPE, useClass: ValidationPipe }] })
export class AppModule {}
