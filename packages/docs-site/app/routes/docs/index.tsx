import { LoaderFn, redirectTo } from "remastered";
import { docList } from "../../docList";
import _ from "lodash";

export const loader: LoaderFn<unknown> = async () => {
  const list = await docList();
  let file = list[0];

  while (file.type !== "file") {
    file = file.children[0];
  }

  return redirectTo(`/docs/${file.link}`);
};
