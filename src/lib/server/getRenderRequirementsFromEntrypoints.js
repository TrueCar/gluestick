import { parse as parseURL } from "url";
import { getWebpackEntries } from "../buildWebpackEntries";
import isChildPath from "../isChildPath";
import { getHttpClient } from "gluestick-shared";

export default function getRenderRequirementsFromEntrypoints (req, config={}, customRequire=require) {
  const httpClient = getHttpClient(config.httpClient, req);
  const entryPoints = getWebpackEntries();
  const sortedEntries = Object.keys(entryPoints).sort((a, b) => {
    const bSplitLength = b.split("/").length;
    const aSplitLength = a.split("/").length;
    if (bSplitLength === aSplitLength) {
      return b.length - a.length;
    }

    return bSplitLength - aSplitLength;
  });

  const { path: urlPath } = parseURL(req.url);

  for (const path of sortedEntries) {
    if (isChildPath(path, urlPath)) {
      const { routes, index, fileName, filePath } = entryPoints[path];
      return {
        Index: customRequire(index + ".js").default,
        store: customRequire(filePath).getStore(httpClient),
        getRoutes: customRequire(routes).default,
        fileName
      };
    }
  }
}

