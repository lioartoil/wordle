import fs from 'fs/promises';

import { answers } from 'src/constants/allowed-and-answer';

export const createWikiWords = async () => {
  const words = (
    await fs.readFile(
      '/Users/lioartoil/Desktop/playground/wordle/src/constants/wiki-words.txt',
      'utf-8',
    )
  )
    .toLowerCase()
    .split('\n')
    .map(line => line.split(/\s+/).filter(word => word.length)[0])
    .filter(word => /^[a-z]{5}$/i.test(word));

  fs.writeFile(
    '/Users/lioartoil/Desktop/playground/wordle/src/constants/wiki-cleaned-words.txt',
    words.join('\n'),
  );
};

export const createNewWordList = async () => {
  const words = (
    await fs.readFile(
      '/Users/lioartoil/Desktop/playground/wordle/src/constants/wiki-cleaned-words.txt',
      'utf-8',
    )
  ).split('\n');

  const includedWords = words.filter(word => answers.includes(word));

  fs.writeFile(
    '/Users/lioartoil/Desktop/playground/wordle/src/constants/answer.txt',
    includedWords.join('\n'),
  );
};
