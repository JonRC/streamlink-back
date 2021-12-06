import { primeSearch } from "./providers/prime";
import { readFileSync } from "fs";
import { findBestMatch } from "string-similarity";
import { netflixSearch } from "./providers/netflix";
import { globoplaySearch } from "./providers/globoplay";
import { disneySearch } from "./providers/disney";

const keyWord = "CSI";

Promise.all([
  primeSearch(keyWord),
  netflixSearch(keyWord),
  globoplaySearch(keyWord),
  disneySearch(keyWord),
]).then((resultByProvider) => {
  const results = resultByProvider.flat();

  const match = findBestMatch(
    keyWord,
    results.map((result) => result.title)
  );

  const bestResult = results[match.bestMatchIndex];

  console.log({ bestResult });
});
