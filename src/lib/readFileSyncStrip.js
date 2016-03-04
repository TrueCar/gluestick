import fs from "fs";

export default function readFileSyncStrip(filePath, encoding="utf8") {
  return fs.readFileSync(filePath, encoding).replace(/\s*$/, "");
}
