import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { WORDS } from './words';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);

  findHexWords();
}

bootstrap();

const findHexWords = () => {
  const wordsGroups = [
    WORDS.split('\n').filter(value => {
      const [one, two, three, four, five] = ['', '', 'ocn', 'ct', ''];
      const all = `${one}${two}${three}${four}${five}`;

      return (
        // 's' === value[0] &&
        value[1] === 'o' &&
        // 'u' === value[2] &&
        value[3] === 'n' &&
        value[4] === 't' &&
        one.split('').every(character => value[0] !== character) &&
        two.split('').every(character => value[1] !== character) &&
        three.split('').every(character => value[2] !== character) &&
        four.split('').every(character => value[3] !== character) &&
        five.split('').every(character => value[4] !== character) &&
        all.split('').every(character => {
          return value.split('').includes(character);
        }) &&
        ''.split('').every(character => {
          return !value.split('').includes(character);
        })
      );
    }),
  ];

  if (wordsGroups.filter(words => words.length === 1).length) {
    return wordsGroups.filter(words => words.length === 1)[0][0];
  }

  const lettersPointGroups = wordsGroups.map(words => getLettersPoint(words));
  const uniqueWords = wordsGroups.reduce((result, words) => {
    words.forEach(word => result.add(word));

    return result;
  }, new Set<string>());

  const wordPointsGroups = lettersPointGroups.map(lettersPoint => {
    return getWordsPoint([...uniqueWords], lettersPoint);
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

  sumWordPoints.sort(sortBySize);

  const returnWords =
    sumWordPoints.length > 5
      ? sumWordPoints.filter(({ occursSize }) => occursSize >= sumWordPoints[4].occursSize)
      : sumWordPoints;

  return returnWords.map(({ word, occursSize, matchesSize }) => ({
    word,
    occursCount: occursSize,
    matchesCount: matchesSize,
  }));
};

const sortBySize = (
  a: { word: string; occursSize: number; matchesSize: number },
  b: { word: string; occursSize: number; matchesSize: number },
) => {
  return a.occursSize === b.occursSize
    ? b.matchesSize - a.matchesSize
    : b.occursSize - a.occursSize;
};

const getLettersPoint = (words: string[]) => {
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
};

const getWordsPoint = (
  words: string[],
  lettersPoint: {
    [key: string]: { [key: number]: Set<string>; sum: Set<string> };
  },
) => {
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
};
