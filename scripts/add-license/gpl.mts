import { readFile } from "node:fs/promises";

const GPL = (await readFile("./gpl.txt", { encoding: "utf-8" })).split("\n");
const JS_GPL = GPL.map((line) => `// ${line}`).join("\n");
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
