import { readFile, glob } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import GPL from "./gpl.mts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCLUDED = ["scripts/", "packages/*/src/"];
const EXCLUDED = ["**/dist/"];

interface AddLicenseProps {
  check?: true | undefined;
}

export default async function addLicense(opt: AddLicenseProps) {
  //
}

if (import.meta.main) {
  await addLicense({});
}
