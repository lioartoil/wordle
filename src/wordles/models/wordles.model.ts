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
