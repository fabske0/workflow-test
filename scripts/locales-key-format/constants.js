/**
 * The directory containing all locales files.
 */
export const LOCALES_DIR = "."; // todo: remove later???
/**
 * A list of files to ignore.
 * @type {string[]}
 */
export const ignoreList = [
  "README.md",
  ".gitignore",
  ".git",
  ".github",
  ".gitmodules",
  "LICENSE",
  "node_modules",
  "package.json",
  "modifier-type.json", // todo: remove after modifier rework
  "modifier.json",
  "modifier-select-ui-handler.json",
];
/**
 * A list of inbuild i18next key extensions which use snake_case instead of camelCase.
 * @example `AceTrainer_male`
 * @link https://www.i18next.com/translation-function/context
 * @returns {string[]}
 */
export const i18nextKeyExtensions = ["_male", "_female", "_ordinal", "_one", "_two", "_other", "_few"]; // todo: add numberes `_1` ...

/**
 * The key format to check for.
 * @type {format}
 */
export const keyFormat = "camelCase";

/**
 * The file name format to check for.
 * @type {format}
 */
export const fileNameFormat = "kebab-case";

/**
 * The file extension to check.
 */
export const fileExtension = ".json";
