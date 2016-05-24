import { relative } from "path";

export default function isChildPath (parent, child) {
  if (parent === "/") {
    return true;
  }

  return relative(parent, child).substr(0, 1) !== ".";
}

