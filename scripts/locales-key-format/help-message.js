import chalk from "chalk";
import { getLanguageCodes } from "./get-files.js";

/** Show help/usage text for the `check-locales` CLI. */
export function showHelpText() {
  console.log(`
Usage: ${chalk.cyan("pnpm check-locales [options] <language-codes>")}

${chalk.hex("#ffa500")("Options:")}
  ${chalk.blue("-h, --help")}               Show this help message.
  ${chalk.blue("-k, --keys")}               Check the key format of all locales files.
  ${chalk.blue("-f, --filenames")}          Check the file name format of all locales files.
  ${chalk.blue("-v, --verbose")}            Print verbose output.
  ${chalk.blue("-l, --list")}               List all available language codes.
`);
}

export async function listLanguages() {
  const languageCodes = getLanguageCodes().sort();
  console.log(chalk.hex("#ffa500")("Available languages:"));
  for (const languageCode of languageCodes) {
    console.log(chalk.cyan(languageCode));
  }
  console.log(chalk.red.bold("Language codes are case sensitive!"));
}
