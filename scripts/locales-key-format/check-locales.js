import { existsSync, readFileSync } from "node:fs";
import {
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toPascalSnakeCase,
  toSnakeCase,
  toUpperSnakeCase,
} from "../helpers/strings.js";
import { fileNameFormat, i18nextKeyExtensions, keyFormat, LOCALES_DIR } from "./constants.js";
import { getFiles } from "./get-files.js";

//#region Key Format

/**
 * Check the key format of all locales files.
 * @param {options} options - The options to use.
 * @returns {Promise<incorrectKeys>} The incorrect keys found.
 */
export async function checkLocaleKeys(options) {
  return new Promise(resolve => {
    /** @type {incorrectKeys} */
    let incorrectKeys = {};

    for (const languageCode of options.languages) {
      const path = `${LOCALES_DIR}/${languageCode}`;
      const files = getFiles(path);
      let languageCodeIncorrectKeys = 0;
      for (const filePath of files) {
        const fileIncorrectKeys = checkForIncorrectKeys(filePath, options);
        if (fileIncorrectKeys !== null) {
          incorrectKeys = { ...incorrectKeys, ...fileIncorrectKeys };
          languageCodeIncorrectKeys += Object.values(fileIncorrectKeys).reduce((sum, val) => sum + val.length, 0);
        }
      }
      console.log(
          `Checked ${files.length} files for ${languageCode} and found ${languageCodeIncorrectKeys} incorrect keys.`,
      );
    }
    resolve(incorrectKeys);
  });
}

/**
 * Read a file and return its content.
 * @param {string} filePath - The path to the file to read.
 * @returns {string | null} The content of the file.
 */
function readFileContent(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return readFileSync(filePath, "utf8");
}

/**
 * Check a file for incorrect keys.
 * @param {string} filePath - The path to the file to check.
 * @param {options} options - The options to use.
 * @returns {incorrectKeys | null} The incorrect keys found in the file.
 */
function checkForIncorrectKeys(filePath, options) {
  /** @type {incorrectKeys} */
  const incorrectKeys = {};
  if (options.verbose) {
    console.log(`checking file: ${filePath}`);
  }

  let data;
  try {
    const fileContent = readFileContent(filePath);
    if (fileContent === null) {
      return null;
    }
    data = JSON.parse(fileContent);
  } catch (e) {
    console.error(`Error parsing ${filePath}: ${e.message}`);
    process.exit(1);
  }
  const keys = Object.keys(data);

  const entries = keys.map((key, index) => analyzeKey(key, index, options)).filter(e => e !== null);

  if (entries.length > 0) {
    incorrectKeys[filePath] = entries;
  }

  if (entries.length === 0 && options.verbose) {
    console.log(`No incorrect keys found in ${filePath}`);
  } else {
    if (options.verbose) {
      console.log(`Found ${entries.length} incorrect keys in ${filePath}`);
    }
  }
  return incorrectKeys;
}

/**
 * Analyze a key for correctness.
 * @param {string} key - The key to analyze.
 * @param {number} index - The index of the key.
 * @param {options} options - The options to use.
 * @returns {incorrectKey | null} The incorrect key and its correction or null if the key is correct.
 */
function analyzeKey(key, index, options) {
  const line = index + 2;
  let correctKey = getCorrectFormat(key, keyFormat);
  if (key.includes("_")) {
    correctKey = processExtensions(key);
  }
  if (correctKey === key) {
    return null;
  }
  if (options.verbose) {
    console.log(`Incorrect key found at line ${line}: ${key}`);
    console.log(`Correct key: ${correctKey}`);
  }
  return { incorrectKey: key, correctedKey: correctKey, line: line };
}

/**
 * Process i18next key extensions.
 * @param {string} key - The key to process.
 * @returns {string} The correct processed key.
 */
function processExtensions(key) {
  let ret;
  const parts = key.split("_");
  ret = parts[0];
  for (const part of parts.slice(1)) {
    if (i18nextKeyExtensions.includes(`_${part}`)) {
      ret += `_${part}`;
    } else {
      ret += toPascalCase(part);
    }
  }
  return ret;
}

//#endregion

//#region File Name Format

/**
 * Check the file name format of all locales files.
 * @param {options} options - The options to use.
 * @returns {Promise<incorrectFileName[]>} The incorrect file names found.
 */
export async function checkLocaleFileNames(options) {
  return new Promise(resolve => {
    /** @type {incorrectFileName[]} */
    const incorrectFileNames = [];

    for (const languageCode of options.languages) {
      const path = `${LOCALES_DIR}/${languageCode}`;
      const files = getFiles(path);
      let languageCodeIncorrectFiles = 0;
      for (const filePath of files) {
        const fileNameResult = checkForIncorrectFileName(filePath, options);
        if (fileNameResult !== null) {
          incorrectFileNames.push(fileNameResult);
          languageCodeIncorrectFiles++;
        }
      }
      console.log(
          `Checked ${files.length} files for ${languageCode} and found ${languageCodeIncorrectFiles} incorrect file names.`,
      );
    }
    resolve(incorrectFileNames);
  });
}

/**
 * Check a file name for incorrect format.
 * @param {string} filePath - The path to the file to check.
 * @param {options} options - The options to use.
 * @returns {incorrectFileName | null} The incorrect file name found.
 */
function checkForIncorrectFileName(filePath, options) {
  if (options.verbose) {
    console.log(`checking file: ${filePath}`);
  }

  const fileName = filePath.split("/").pop();
  if (fileName === undefined) {
    return null;
  }

  const correctFileName = getCorrectFormat(fileName, fileNameFormat);
  if (correctFileName === fileName) {
    return null;
  }
  if (options.verbose) {
    console.log(`Incorrect file name found: ${fileName}`);
    console.log(`Correct file name: ${correctFileName}`);
  }
  return { incorrectFileName: fileName, correctedFileName: correctFileName };
}

//#endregion

/**
 * Returns the correct format for the provided format.
 * @param {string} key - The key to get the correct format for.
 * @param {format} format - The format to get the correct format for.
 * @returns {string} The correct format.
 */
function getCorrectFormat(key, format) {
  switch (format) {
    case "camelCase":
      return toCamelCase(key);
    case "kebab-case":
      return toKebabCase(key);
    case "PascalCase":
      return toPascalCase(key);
    case "snake_case":
      return toSnakeCase(key);
    case "UPPER_SNAKE_CASE":
      return toUpperSnakeCase(key);
    case "Pascal_Snake_Case":
      return toPascalSnakeCase(key);
    default:
      console.error(`Unknown format: ${format}`);
      process.exit(1);
  }
}
