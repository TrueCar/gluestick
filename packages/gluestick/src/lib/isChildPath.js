import { relative } from "path";

const cache = {};

export default function isChildPath (parent, child) {
  child = child.split("?")[0];
  const key = `${parent}-${child}`;
  const cacheResult = cache[key];

  if (cacheResult) {
    return cacheResult;
  }

  if (parent === "/") {
    return cache[key] = true;
  }

  return cache[key] = relative(parent, child).substr(0, 1) !== ".";
}

