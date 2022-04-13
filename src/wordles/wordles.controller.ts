import { Body, Controller, Post } from '@nestjs/common';

import { GetWordsRequest } from './dtos/get-words.request.dto';
import { WordlesService } from './wordles.service';

@Controller('wordles')
export class WordlesController {
  constructor(private wordlesService: WordlesService) {}

  @Post()
  getWords(@Body() request: GetWordsRequest) {
    return this.wordlesService.getWords(request);
  }
}
