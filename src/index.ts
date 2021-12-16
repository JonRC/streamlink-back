import { primeSearch } from "./services/prime";
import { readFileSync, writeFileSync } from "fs";
import { findBestMatch } from "string-similarity";
import { netflixSearch } from "./services/netflix";
import { globoplaySearch } from "./services/globoplay";
import { disneySearch } from "./services/disney";
import { hboSearch } from "./services/hbo";
import { search } from "./services/search";

const keyword = "chicago med";

search(keyword).then((search) => {
  writeFileSync("result.json", JSON.stringify(search, null, 2));
});
