import { primeSearch } from "./providers/prime";
import { readFileSync } from "fs";
import { findBestMatch } from "string-similarity";
import { netflixSearch } from "./providers/netflix";

const keyWord = "criando";

Promise.all([primeSearch(keyWord), netflixSearch(keyWord)]).then(
  (resultByProvider) => {
    const results = resultByProvider.flat();

    const match = findBestMatch(
      keyWord,
      results.map((result) => result.title)
    );

    const bestResult = results[match.bestMatchIndex];

    console.log({ bestResult });
  }
);
