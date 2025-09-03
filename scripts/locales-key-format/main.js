import chalk from "chalk";
import { listLanguages, showHelpText } from "../locales-key-format/help-message.js";
import { checkLocaleFileNames, checkLocaleKeys } from "./check-locales.js";
import { getLanguageCodes } from "./get-files.js";

/**
 * @packageDocumentation
 * This script will check the key format of locales files
 * Usage: `pnpm check-locales <options> [languages]`
 * Example: `pnpm check-locales -k -f en de fr`. This checks the key and file name format of en, de and fr.
 * If no languages are provided, it will check all languages.
 */

const version = "1.0.0";

async function main() {
  console.log(chalk.hex("#FF7F50")(`🍳 Locales key format checker v${version}`));

  const args = process.argv.slice(2);
  const options = await parseArgs(args);

  if (!options.checkKeys && !options.checkFileNames) {
    console.error(chalk.red.bold("✗ Error: No options provided!"));
    showHelpText();
    process.exit(0);
  }

  /** @type {incorrectKeys} */
  let keyOutput = {};
  /** @type {incorrectFileName[]} */
  let fileNameOutput = [];

  if (options.checkKeys) {
    console.log(chalk.hex("#ffa500")("Checking key format..."));
    keyOutput = await checkLocaleKeys(options);
  }
  if (options.checkFileNames) {
    console.log(chalk.hex("#ffa500")("Checking file name format..."));
    fileNameOutput = await checkLocaleFileNames(options);
  }

  if (options.checkKeys) {
    displayKeyResults(keyOutput, options);
  }

  if (options.checkFileNames) {
    displayFileNameResults(fileNameOutput, options);
  }
}

/**
 * Parse the command line arguments.
 * @param {string[]} args - The command line arguments
 * @returns {options}
 */
function parseArgs(args) {
  const optionArgs = args.filter(arg => arg.startsWith("-"));
  const languageArgs = args.filter(arg => !arg.startsWith("-"));
  /** @type {options} */
  const options = {
    checkKeys: false,
    checkFileNames: false,
    verbose: false,
    languages: [],
  };

  for (const arg of optionArgs) {
    switch (arg) {
      case "-h":
      case "--help":
        showHelpText();
        process.exit(0);
        break;
      case "-k":
      case "--keys":
        options.checkKeys = true;
        break;
      case "-f":
      case "--filenames":
        options.checkFileNames = true;
        break;
      case "-v":
      case "--verbose":
        options.verbose = true;
        break;
      case "-l":
      case "--list":
        listLanguages();
        process.exit(0);
        break;
      default:
        console.error(chalk.red.bold(`Unknown option: ${arg}`));
        showHelpText();
        process.exit(1);
    }
  }

  const validLanguages = getLanguageCodes();
  for (const language of languageArgs) {
    if (!validLanguages.includes(language)) {
      console.error(chalk.red.bold(`Invalid language: ${language}`));
      listLanguages();
      process.exit(1);
    }
    options.languages.push(language);
  }
  if (options.languages.length === 0) {
    // get all languages if none are specified
    options.languages = getLanguageCodes();
  }
  return options;
}

/**
 * Display the results for the key format check.
 * @param {incorrectKeys} result - The incorrect keys found.
 */
function displayKeyResults(result, options) {
  console.log(chalk.hex("#ffa500")("Key Result:"));
  if (Object.keys(result).length > 1) {
    process.exitCode = 1;
    // Log incorrect keys per language
    for (const languageCode of options.languages) {
      const incorrectKeysForLang = Object.entries(result).filter(([path]) => path.includes(`/${languageCode}/`));
      const incorrectKeysCount = incorrectKeysForLang.reduce((sum, [_, val]) => sum + val.length, 0);
      const color = incorrectKeysCount > 0 ? chalk.red.bold : chalk.green.bold;
      console.log(color(`${languageCode}: ${incorrectKeysCount} incorrect keys`));
      if (options.verbose) {
        // log all incorrect keys for the language
        displayIncorrectKeys(languageCode, Object.fromEntries(incorrectKeysForLang));
      }
    }
    const incorrectKeyCount = Object.values(result).reduce((sum, val) => sum + val.length, 0);
    console.log(chalk.red(`✗ Found ${incorrectKeyCount} incorrect keys in ${options.languages.length} languages.`));
  } else {
    console.log(chalk.green("✔ No incorrect keys found!"));
    process.exitCode = 0;
  }
}

/**
 * Display the results for the file name format check.
 * @param {incorrectFileName[]} result - The incorrect keys found.
 */
function displayFileNameResults(result, options) {
  console.log(chalk.hex("#ffa500")("File Name Result:"));
  if (result.length > 0) {
    process.exitCode = 1;
    // Log incorrect file names per language
    for (const languageCode of options.languages) {
      const incorrectFileNamesForLang = result.filter(fileName =>
        fileName.incorrectFileName.includes(`/${languageCode}/`),
      ).length;
      const color = incorrectFileNamesForLang > 0 ? chalk.red : chalk.green;
      console.log(color(`${languageCode}: ${incorrectFileNamesForLang} incorrect file names`));
    }
    const incorrectFileNameCount = result.length;
    console.log(
      chalk.red(`✗ Found ${incorrectFileNameCount} incorrect file names in ${options.languages.length} languages.`),
    );
  } else {
    console.log(chalk.green("✔ No incorrect file names found!"));
    process.exitCode = 0;
  }
}

/**
 * Display the incorrect keys for a language.
 * @param {string} languageCode - The language code.
 * @param {incorrectKeys} incorrectKeysForLang - The number of incorrect keys for the language.
 */
function displayIncorrectKeys(languageCode, incorrectKeysForLang) {
  if (Object.keys(incorrectKeysForLang).length <= 0) {
    return;
  }
  for (const [filePath, incorrectKeys] of Object.entries(incorrectKeysForLang)) {
    if (!filePath.includes(`/${languageCode}/`)) {
      continue;
    }
    // log the filepath
    console.log(chalk.grey(`\nFile: ${filePath}`));
    for (const incorrectKey of incorrectKeys) {
      console.log(
        chalk.red(`Incorrect key found at line ${chalk.bold(incorrectKey.line)}: ${incorrectKey.incorrectKey}`),
      );
      console.log(chalk.blue(`Correct key: ${incorrectKey.correctedKey}`));
    }
  }
}

main();
