import * as core from "@actions/core";
import { existsSync, lstatSync, readdirSync } from "node:fs";
import { format } from "node:util";
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

  if (lstatSync(filePath).isDirectory()) {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const filePath = `${dir}/${entry}`;
        files.push(...getFiles(filePath));
      if (filePath.endsWith(fileExtension) && !ignoreList.includes(entry)) {
        files.push(filePath);
      }
    }
    return files;
  }
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
    core.setFailed(errStr);
    console.error(errStr);
  } else {
    console.log("Locales folder found:", LOCALES_DIR);
    const folders = readdirSync(LOCALES_DIR);

    for (const folder of folders) {
      if (ignoreList.includes(folder)) {
        continue;
      }
      console.log("Found language code:", folder);
      languageCodes.push(folder);
    }
  }

  return languageCodes;
}
