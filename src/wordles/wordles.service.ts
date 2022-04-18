import { Injectable } from '@nestjs/common';

import { WORDS } from 'src/constants/words';

import { GetWordsRequest, Wordle } from './dtos/get-words.request.dto';
import {
  CreateSumPointArgs,
  LettersPoint,
  MappedFilter,
  SumPoint,
  SumWordPoint,
  WordFilterOption,
} from './models/wordles.model';

@Injectable()
export class WordlesService {
  private uniqueWords: Set<string>;
  private wordles: Wordle[];

  getWords({ wordles }: GetWordsRequest) {
    this.wordles = wordles;

    const wordsGroups = this.getFilterWords();
    const correctWords = wordsGroups.filter(words => words.length === 1).flat();
    const lettersPointGroups = wordsGroups.map(words => this.getLettersPoint(words));

    this.uniqueWords = wordsGroups.reduce((result, words) => {
      for (const word of words) result.add(word);

      return result;
    }, new Set<string>());

    const wordPointsGroups = lettersPointGroups.map(letterPointGroup => {
      return this.getWordsPoint(letterPointGroup);
    });

    const sumWordPoints = wordPointsGroups.reduce(
      (result, wordPoints) => {
        for (const wordPoint of wordPoints) {
          const foundWord = result.find(({ word }) => word === wordPoint.word);

          foundWord.matchesSize += wordPoint.matches.size;
          foundWord.occursSize += wordPoint.occurs.size;
        }

        return result;
      },
      Array.from(
        [...this.uniqueWords],
        word => new SumWordPoint(word, correctWords.includes(word)),
      ),
    );

    sumWordPoints.sort(this.sortBySize);

    const returnWords =
      sumWordPoints.length > 10
        ? sumWordPoints.filter(
            ({ occursSize, isCorrect }) => isCorrect || occursSize >= sumWordPoints[9].occursSize,
          )
        : sumWordPoints;

    return returnWords.map(({ word, occursSize, matchesSize, isCorrect }) => ({
      word,
      occursCount: this.convertToPercent(occursSize / this.uniqueWords.size),
      matchesCount: this.convertToPercent(matchesSize / this.uniqueWords.size),
      isCorrect: isCorrect || undefined,
    }));
  }

  private convertToPercent(fraction: number) {
    const percent = fraction ? (fraction * 100).toFixed(2) : '100.00';

    return `${percent}%`;
  }

  private getFilterWords() {
    return this.wordles?.length
      ? this.wordles
          .reduce(
            this.reduceFilters,
            Array.from({ length: this.wordles[0].matches.length }, () => {
              return Array.from<MappedFilter>({ length: 0 });
            }),
          )
          .map(mappedFilters => {
            const filterOptions = mappedFilters.reduce(
              (result, mappedFilter) => this.reduceFilterOptions(result, mappedFilter),
              new WordFilterOption(),
            );

            return WORDS.filter(WORD => this.filterWordFunction(WORD, filterOptions));
          })
      : [WORDS];
  }

  private reduceFilterOptions(result: WordFilterOption, { word, yellows, greens }: MappedFilter) {
    const lowerCasedWord = word.toLowerCase();

    for (const [index, character] of lowerCasedWord.split('').entries()) {
      if (greens.includes(index)) {
        result.includeCharacters.push(character);
        result.matchedIndexCharacters.push({ index, character });

        continue;
      }

      if (
        yellows.includes(index) ||
        [...greens, ...yellows].some(match => lowerCasedWord[match] === character)
      ) {
        result.includeCharacters.push(character);

        const foundYellow = result.excludedIndexCharacters.find(
          excludedIndexCharacter => excludedIndexCharacter.index === index,
        );

        if (foundYellow) foundYellow.characters.push(character);
        else result.excludedIndexCharacters.push({ index, characters: [character] });

        continue;
      }

      result.excludeCharacters.push(character);
    }

    return result;
  }

  private reduceFilters(result: MappedFilter[][], { word, matches }: Wordle) {
    for (const [index, { yellows = [], greens = [] }] of matches.entries()) {
      result[index].push({ word, yellows, greens });
    }

    return result;
  }

  private filterWordFunction(
    word: string,
    {
      excludeCharacters,
      excludedIndexCharacters,
      includeCharacters,
      matchedIndexCharacters,
    }: WordFilterOption,
  ) {
    return (
      matchedIndexCharacters.every(({ index, character }) => word[index] === character) &&
      excludedIndexCharacters.every(({ index, characters }) => !characters.includes(word[index])) &&
      excludeCharacters.every(excludeCharacter => !word.split('').includes(excludeCharacter)) &&
      includeCharacters.every(includeCharacter => word.split('').includes(includeCharacter))
    );
  }

  private sortBySize(a: SumWordPoint, b: SumWordPoint) {
    if (a.occursSize === b.occursSize) return b.matchesSize - a.matchesSize;
    if (a.isCorrect === b.isCorrect) return b.occursSize - a.occursSize;

    return a.isCorrect ? -1 : 1;
  }

  private getLettersPoint(words: string[]) {
    return words.reduce((sum, word) => {
      const characters = word.split('');

      for (const [index, character] of characters.entries()) {
        if (sum[character]) {
          if (sum[character][index]?.size) sum[character][index].add(word);
          else sum[character][index] = new Set([word]);

          if (!characters.slice(0, index).includes(character)) {
            sum[character].sum.add(word);
          }
        } else {
          sum[character] = { [index]: new Set([word]), sum: new Set([word]) };
        }
      }

      return sum;
    }, {} as { [key: string]: { [key: number]: Set<string>; sum: Set<string> } });
  }

  private getWordsPoint(lettersPoint: LettersPoint) {
    return [...this.uniqueWords].map(word => {
      const sumPoint = word.split('').reduce((result, character, index) => {
        return this.createSumPoint({ result, character, index, lettersPoint });
      }, new SumPoint());

      return { word, ...sumPoint };
    });
  }

  private createSumPoint({ result, character, index, lettersPoint }: CreateSumPointArgs) {
    if (!lettersPoint[character]) return result;

    const { sum: allWords, [index]: matchWords } = lettersPoint[character];

    if (matchWords.size === this.uniqueWords.size) return result;

    for (const matchWord of matchWords) result.matches.add(matchWord);

    if (allWords.size !== this.uniqueWords.size) {
      for (const allWord of allWords) result.occurs.add(allWord);
    }

    return result;
  }
}
