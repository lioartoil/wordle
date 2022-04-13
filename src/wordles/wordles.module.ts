import { Module } from '@nestjs/common';

import { WordlesController } from './wordles.controller';
import { WordlesService } from './wordles.service';

@Module({ controllers: [WordlesController], providers: [WordlesService] })
export class WordlesModule {}
