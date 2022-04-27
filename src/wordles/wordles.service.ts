import { Injectable } from '@nestjs/common';

import { WORDS } from 'src/constants/words';

import { GetWordsRequest, Wordle } from './dtos/get-words.request.dto';
import { MappedFilter, SumWordPoint, WordFilterOption } from './models/wordles.model';

@Injectable()
export class WordlesService {
  private uniqueWords: Set<string>;
  private wordles: Wordle[];

  getWords({ wordles }: GetWordsRequest) {
    this.wordles = wordles;

    const wordsGroups = this.getFilterWords();
    const correctWords = wordsGroups.filter(words => words.length === 1).flat();

    this.uniqueWords = wordsGroups.reduce((result, words) => {
      for (const word of words) result.add(word);

      return result;
    }, new Set<string>());

    const wordPointsGroups = wordsGroups.map(wordsGroup => {
      return this.getWordsPoint(wordsGroup);
    });

    const sumWordPoints = wordPointsGroups.reduce(
      (result, wordPoints) => {
        for (const wordPoint of wordPoints) {
          const foundWord = result.find(({ word }) => word === wordPoint.word);

          foundWord.matchesSize += wordPoint.matchesCount;
          foundWord.occursSize += wordPoint.occursCount;
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

    const inhomogeneousCharactersLength = [...this.uniqueWords][0]
      .split('')
      .filter((character, index) =>
        [...this.uniqueWords].some(word => word[index] !== character),
      ).length;

    return returnWords.map(({ word, occursSize, matchesSize, isCorrect }) => ({
      word,
      occursCount: this.convertToPercent(
        occursSize / (this.uniqueWords.size * inhomogeneousCharactersLength),
      ),
      matchesCount: this.convertToPercent(
        matchesSize / (this.uniqueWords.size * inhomogeneousCharactersLength),
      ),
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
        result.includedCharacters.push(character);
        result.matchedIndexCharacters.push({ index, character });

        continue;
      }

      const characterIndicesLength = [...greens, ...yellows].filter(
        match => lowerCasedWord[match] === character,
      ).length;

      if (yellows.includes(index) || characterIndicesLength) {
        result.includedCharacters.push(character);

        const foundYellow = result.excludedIndexCharacters.find(
          excludedIndexCharacter => excludedIndexCharacter.index === index,
        );

        if (foundYellow) foundYellow.characters.push(character);
        else {
          result.excludedIndexCharacters.push({ index, characters: [character] });

          if (characterIndicesLength > 1) {
            result.includedWithAmounts.push({ character, amount: characterIndicesLength });
          }
        }

        continue;
      }

      result.excludedCharacters.push(character);
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
      excludedCharacters,
      excludedIndexCharacters,
      includedCharacters,
      includedWithAmounts,
      matchedIndexCharacters,
    }: WordFilterOption,
  ) {
    return (
      matchedIndexCharacters.every(({ index, character }) => word[index] === character) &&
      excludedIndexCharacters.every(({ index, characters }) => !characters.includes(word[index])) &&
      excludedCharacters.every(excludeCharacter => !word.split('').includes(excludeCharacter)) &&
      includedCharacters.every(includeCharacter => word.split('').includes(includeCharacter)) &&
      includedWithAmounts.every(({ character, amount }) => {
        return word.split('').filter(char => char === character).length >= amount;
      })
    );
  }

  private sortBySize(a: SumWordPoint, b: SumWordPoint) {
    if (a.isCorrect !== b.isCorrect) return a.isCorrect ? -1 : 1;
    if (a.occursSize !== b.occursSize) return b.occursSize - a.occursSize;

    return b.matchesSize - a.matchesSize;
  }

  private getWordsPoint(wordsGroup: string[]) {
    return wordsGroup.map(word => {
      const valuedIndices = word.split('').reduce((result, character, index) => {
        if (wordsGroup.some(wordInSet => wordInSet[index] !== character)) result.push(index);

        return result;
      }, Array.from<number>({ length: 0 }));

      const { matchesCount, occursCount } = wordsGroup.reduce(
        (result, wordInSet) => {
          const valuedCharacters = new Set(
            wordInSet.split('').filter((_, index) => valuedIndices.includes(index)),
          );

          result.matchesCount += valuedIndices.filter(
            index => wordInSet[index] === word[index],
          ).length;

          result.occursCount += [...valuedCharacters].filter(character =>
            valuedIndices.some(index => word[index] === character),
          ).length;

          return result;
        },
        { matchesCount: 0, occursCount: 0 },
      );

      return { word, matchesCount, occursCount };
    });
  }
}
