import { existsSync, lstatSync, readdirSync } from "node:fs";
import { format } from "node:util";
import chalk from "chalk";
import { fileExtension, ignoreList, LOCALES_DIR } from "./constants.js";

/**
 * Gets all files in a directory and subdirectories.
 * @param {string} dir
 * @returns {string[]} A list of all files in the directory and subdirectories.
 */
export function getFiles(dir) {
  /**
   * A list of all files in the directory and subdirectories.
   * @type {string[]}
   */
  const files = [];

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const filePath = `${dir}/${entry}`;
    if (lstatSync(filePath).isDirectory()) {
      files.push(...getFiles(filePath));
    }
    if (filePath.endsWith(fileExtension) && !ignoreList.includes(entry)) {
      files.push(filePath);
    }
  }
  return files;
}

/**
 * Get a list of all language codes in the locales folder.
 * @returns {string[]} A list of all language codes.
 */
export function getLanguageCodes() {
  /**
   * A list of all language codes in the locales folder.
   * @type {string[]}
   */
  const languageCodes = [];

  if (!existsSync(LOCALES_DIR)) {
    const errStr = format("Locales folder not found: %s", LOCALES_DIR);
    process.exitCode = 1;
    console.error(chalk.red.bold(errStr));
  } else {
    const folders = readdirSync(LOCALES_DIR);

    for (const folder of folders) {
      if (ignoreList.includes(folder)) {
        continue;
      }
      languageCodes.push(folder);
    }
  }

  return languageCodes;
}
