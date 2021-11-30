import { primeSearch } from "./providers/prime";
import { readFileSync } from "fs";
import { findBestMatch } from "string-similarity";

primeSearch("vinicius").then(console.log);
