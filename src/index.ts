import { primeSearch } from "./providers/prime";
import { readFileSync } from "fs";
import { findBestMatch } from "string-similarity";
import { netflixSearch } from "./providers/nextflix";

const keyWord = "o país";

const searchResults = Promise.all([
  primeSearch(keyWord),
  netflixSearch(keyWord),
]);

searchResults
  .then((searchResults) => searchResults.flat())
  .then((results) =>
    findBestMatch(
      keyWord,
      results.map((result) => result.title)
    )
  )
  .then(console.log);
