// DrFed: A web-based platform for developing and debugging ActivityPub apps
// Copyright (C) 2026 DrFed team
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// oxlint-disable no-console no-magic-numbers
import { glob, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import GPL from "./gpl.mts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const INCLUDED = ["scripts/", "packages/*/src/"];
const EXCLUDED = ["**/dist/"];

type Extension = keyof typeof GPL;

interface AddLicenseProps {
  check?: true | undefined;
}

interface LicenseTarget {
  readonly path: string;
  readonly extension: Extension;
}

interface LicenseCheck extends LicenseTarget {
  readonly hasLicense: boolean;
}

export default async function addLicense(opt: AddLicenseProps) {
  const files = await findIncludedFiles();
  const targets = files
    .map((path) => ({ path, extension: extensionOf(path) }))
    .filter(isLicenseTarget);
  const checks = await Promise.all(targets.map(checkLicense));
  const missing = checks.filter((check) => !check.hasLicense);

  if (missing.length === 0) {
    process.exit(0);
  }

  if (opt.check) {
    for (const file of missing) {
      console.log(relative(ROOT, file.path));
    }
    process.exit(1);
  }

  await Promise.all(missing.map((file) => addLicenseHeader(file)));
}

async function findIncludedFiles(): Promise<string[]> {
  const patterns = INCLUDED.map((dir) => `${dir}**/*`);
  const files: string[] = [];
  for await (const entry of glob(patterns, {
    cwd: ROOT,
    exclude: EXCLUDED,
    withFileTypes: true,
  })) {
    if (entry.isFile()) {
      files.push(join(entry.parentPath, entry.name));
    }
  }
  return files;
}

function extensionOf(path: string): string {
  return extname(path).slice(1);
}

function isLicenseTarget(
  file: Readonly<{ path: string; extension: string }>,
): file is LicenseTarget {
  return Object.hasOwn(GPL, file.extension);
}

async function readLines(path: string): Promise<string[]> {
  const content = await readFile(path, { encoding: "utf-8" });
  return content.split("\n");
}

function shebangOffset(lines: readonly string[]): number {
  return lines[0]?.startsWith("#!") ? 1 : 0;
}

async function checkLicense(target: LicenseTarget): Promise<LicenseCheck> {
  const header = GPL[target.extension];
  const lines = await readLines(target.path);
  const offset = shebangOffset(lines);
  const headerLineCount = header.split("\n").length;
  const actualHeader = lines.slice(offset, offset + headerLineCount).join("\n");
  return { ...target, hasLicense: actualHeader === header };
}

async function addLicenseHeader(target: LicenseTarget): Promise<void> {
  const header = GPL[target.extension];
  const lines = await readLines(target.path);
  const offset = shebangOffset(lines);
  const updatedLines = [
    ...lines.slice(0, offset),
    ...header.split("\n"),
    ...lines.slice(offset),
  ];
  await writeFile(target.path, updatedLines.join("\n"), { encoding: "utf-8" });
}

if (import.meta.main) {
  await addLicense({
    check: process.argv.includes("--check") ? true : undefined,
  });
}
