import { getLanguageCodes } from "./get-files.js"

/** Show help/usage text for the `check-locales` CLI. */
export function showHelpText() {
    console.log(`
Usage: ${"pnpm check-locales [options] <language-codes>"}

${"Options:"}
  ${"-h, --help"}               Show this help message.
  ${"-k, --keys"}               Check the key format of all locales files.
  ${"-f, --filenames"}          Check the file name format of all locales files.
  ${"-v, --verbose"}            Print verbose output.
  ${"-l, --list"}               List all available language codes.
`)
}

export async function listLanguages() {
    const languageCodes = getLanguageCodes().sort()
    console.log("Available languages:")
    for (const languageCode of languageCodes) {
        console.log(languageCode)
    }
    console.log("Language codes are case sensitive!")
}
