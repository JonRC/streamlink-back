import { Request, Response } from "express";
import { doSearch } from "../../services/doSearch";

export const doSearchController = async (
  request: Request<{}, {}, { keyword: string }>,
  response: Response
) => {
  const { keyword } = request.body;

  const search = await doSearch(keyword);

  const searchMaxLength = search.providers.length * 10;

  search.goodContents = search.goodContents.slice(0, searchMaxLength);
  search.contents = search.contents.slice(0, searchMaxLength);

  response.json(search);
};
