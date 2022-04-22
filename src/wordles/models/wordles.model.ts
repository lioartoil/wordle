class Point {
  sum: Set<string>;
  [key: number]: Set<string>;
}

export class LettersPoint {
  [key: string]: Point;
}

export class SumPoint {
  matches = new Set<string>();
  occurs = new Set<string>();
}

export class CreateSumPointArgs {
  character: string;
  index: number;
  lettersPoint: LettersPoint;
  result: SumPoint;
}

export class MappedFilter {
  greens: number[];
  word: string;
  yellows: number[];
}

export class SumWordPoint {
  matchesSize = 0;
  occursSize = 0;

  constructor(public word: string, public isCorrect: boolean) {}
}

class ExcludedIndexCharacter {
  characters: string[];
  index: number;
}

class IncludedWithAmount {
  amount: number;
  character: string;
}

class MatchedIndexCharacter {
  character: string;
  index: number;
}

export class WordFilterOption {
  excludedCharacters: string[] = [];
  excludedIndexCharacters: ExcludedIndexCharacter[] = [];
  includedCharacters: string[] = [];
  includedWithAmounts: IncludedWithAmount[] = [];
  matchedIndexCharacters: MatchedIndexCharacter[] = [];
}
