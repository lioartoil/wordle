import { Injectable } from '@nestjs/common';

import { WORDS } from 'src/constants/words';

import { GetWordsRequest, Try, Wordle } from './dtos/get-words.request.dto';
import { WordFilterOption } from './models/wordles.model';

@Injectable()
export class WordlesService {
  getWords({ wordles }: GetWordsRequest) {
    const wordsGroups = this.getFilterWords(wordles);

    if (wordsGroups.filter(words => words.length === 1).length) {
      return wordsGroups.filter(words => words.length === 1)[0][0];
    }

    const lettersPointGroups = wordsGroups.map(words => this.getLettersPoint(words));
    const uniqueWords = wordsGroups.reduce((result, words) => {
      words.forEach(word => result.add(word));

      return result;
    }, new Set<string>());

    const wordPointsGroups = lettersPointGroups.map(lettersPoint => {
      return this.getWordsPoint([...uniqueWords], lettersPoint);
    });

    const sumWordPoints = wordPointsGroups.reduce(
      (result, wordPoints) => {
        wordPoints.forEach(wordPoint => {
          const foundWord = result.find(({ word }) => word === wordPoint.word);

          foundWord.matchesSize += wordPoint.matches.size;
          foundWord.occursSize += wordPoint.occurs.size;
        });

        return result;
      },
      Array.from([...uniqueWords], word => ({ word, occursSize: 0, matchesSize: 0 })),
    );

    sumWordPoints.sort(this.sortBySize);

    const returnWords =
      sumWordPoints.length > 10
        ? sumWordPoints.filter(({ occursSize }) => occursSize >= sumWordPoints[9].occursSize)
        : sumWordPoints;

    return returnWords.map(({ word, occursSize, matchesSize }) => ({
      word,
      occursCount: occursSize,
      matchesCount: matchesSize,
    }));
  }

  private getFilterWords(wordles: Wordle[]) {
    return wordles?.length
      ? wordles.map(({ tries }) => {
          const filterOptions = tries.reduce((result, wordleTry) => {
            const { word, greens = [], yellows = [] } = wordleTry;
            const lowerCasedWord = word.toLowerCase();

            if (greens.length) {
              for (const index of greens) {
                result.indexedGreens.push({ index, character: lowerCasedWord[index] });
                result.includeCharacters.push(lowerCasedWord[index]);
              }
            }

            if (yellows.length) this.updateYellowCharacters(result, wordleTry);

            result.excludeCharacters.push(
              ...lowerCasedWord
                .split('')
                .filter(
                  character =>
                    ![...greens, ...yellows]
                      .map(index => lowerCasedWord[index])
                      .includes(character),
                ),
            );

            return result;
          }, new WordFilterOption());

          return WORDS.filter(word => this.filterWordFunction(word, filterOptions));
        })
      : [WORDS];
  }

  private updateYellowCharacters(result: WordFilterOption, { word, yellows }: Try) {
    for (const index of yellows) {
      const foundYellow = result.indexedYellows.find(
        indexedYellow => indexedYellow.index === index,
      );

      if (foundYellow) foundYellow.characters.push(word[index]);
      else result.indexedYellows.push({ index, characters: [word[index]] });

      result.includeCharacters.push(word[index]);
    }
  }

  private filterWordFunction(
    word: string,
    { indexedGreens, indexedYellows, excludeCharacters, includeCharacters }: WordFilterOption,
  ) {
    return (
      indexedGreens.every(({ index, character }) => word[index] === character) &&
      indexedYellows.every(({ index, characters }) => !characters.includes(word[index])) &&
      excludeCharacters.every(excludeCharacter => !word.split('').includes(excludeCharacter)) &&
      includeCharacters.every(includeCharacter => word.split('').includes(includeCharacter))
    );
  }

  private sortBySize(
    a: { word: string; occursSize: number; matchesSize: number },
    b: { word: string; occursSize: number; matchesSize: number },
  ) {
    return a.occursSize === b.occursSize
      ? b.matchesSize - a.matchesSize
      : b.occursSize - a.occursSize;
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

  private getWordsPoint(
    words: string[],
    lettersPoint: {
      [key: string]: { [key: number]: Set<string>; sum: Set<string> };
    },
  ) {
    return words.map(word => {
      const sumPoint = word.split('').reduce(
        (result, character, index, characters) => {
          if (!lettersPoint[character] || !lettersPoint[character][index]) {
            return result;
          }

          const { sum: allWords, [index]: matchWords } = lettersPoint[character];

          if (matchWords.size !== words.length) {
            matchWords.forEach(matchWord => result.matches.add(matchWord));

            if (
              !characters
                .slice(0, index)
                .filter(letter => {
                  return lettersPoint[letter] && lettersPoint[letter][index]?.size !== words.length;
                })
                .includes(character)
            ) {
              allWords.size === words.length
                ? matchWords.forEach(matchWord => result.occurs.add(matchWord))
                : allWords.forEach(allWord => result.occurs.add(allWord));
            }
          }

          return result;
        },
        { occurs: new Set(), matches: new Set() },
      );

      return { word, ...sumPoint };
    });
  }
}
