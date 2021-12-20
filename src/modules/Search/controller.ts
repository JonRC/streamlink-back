import { Request, Response } from "express";
import { Content } from "../../entities/Content";
import { doSearch } from "../../services/doSearch";
import axios from "axios";
import sizeOf from "image-size";

export const doSearchController = async (
  request: Request<{}, {}, { keyword: string }>,
  response: Response
) => {
  const { keyword } = request.body;

  const search = await doSearch(keyword);

  const searchMaxLength = search.providers.length * 10;

  search.goodContents = search.goodContents.slice(0, searchMaxLength);
  search.contents = search.contents.slice(0, searchMaxLength);

  search.contents = await Promise.all(search.contents.map(resolveDimension));
  search.bestContents = await Promise.all(
    search.bestContents.map(resolveDimension)
  );

  response.json(search);
};

const resolveDimension = async (content: Content): Promise<Content> => {
  if (content.image.width) return content;

  const { url } = content.image;

  const { data: imageBuffer } = await axios({
    url,
    method: "get",
    responseType: "arraybuffer",
  });

  const { width, height } = sizeOf(imageBuffer);

  content.image.height = height;
  content.image.width = width;

  return content;
};
