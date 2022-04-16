class IndexedGreen {
  index: number;
  character: string;
}

class IndexedYellow {
  index: number;
  characters: string[];
}

export class WordFilterOption {
  excludeCharacters: string[] = [];
  includeCharacters: string[] = [];
  indexedGreens: IndexedGreen[] = [];
  indexedYellows: IndexedYellow[] = [];
}

export class UpdateYellowCharactersArgs {
  result: WordFilterOption;
  word: string;
  yellows: number[];
}

export class MappedFilter {
  word: string;
  yellows: number[];
  greens: number[];
}
