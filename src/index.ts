import { writeFileSync } from "fs";
import { search } from "./services/search";

const keyword = "black mirror";
import moment from "moment";

search(keyword).then((search) => {
  writeFileSync("result.json", JSON.stringify(search, null, 2));
  console.log(
    search.contents.length,
    moment(search.finishedAt).diff(search.startedAt, "milliseconds")
  );
});
