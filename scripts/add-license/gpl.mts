import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GPL_TXT_PATH = join(dirname(fileURLToPath(import.meta.url)), "gpl.txt");
const GPL = (await readFile(GPL_TXT_PATH, { encoding: "utf-8" }))
  .trimEnd()
  .split("\n");
const JS_GPL = GPL.map((line) => (line === "" ? "//" : `// ${line}`)).join(
  "\n",
);
const CSS_GPL = ["/*", ...GPL, "*/"].join("\n");
const GPL_BY_EXT = {
  ts: JS_GPL,
  tsx: JS_GPL,
  mts: JS_GPL,
  cts: JS_GPL,
  js: JS_GPL,
  jsx: JS_GPL,
  mjs: JS_GPL,
  cjs: JS_GPL,
  css: CSS_GPL,
};

export default GPL_BY_EXT;
