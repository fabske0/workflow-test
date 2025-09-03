import * as core from "@actions/core"
import { checkLocaleFileNames, checkLocaleKeys } from "./check-locales.js"
import { COLORS } from "./constants.js"
import { getLanguageCodes } from "./get-files.js"

/**
 * @packageDocumentation
 * This script will check the key format of locales files
 * Usage: `pnpm check-locales <options> [languages]`
 * Example: `pnpm check-locales -k -f en de fr`. This checks the key and file name format of en, de and fr.
 * If no languages are provided, it will check all languages.
 */

const version = "1.0.0"

async function main() {
    core.info(`\u001b[38;2;255;127;80m🍳 Locales format checker v${version}`)

    try {
        const args = process.argv.slice(2)
        const options = await parseArgs(args)

        if (!options.checkKeys && !options.checkFileNames) {
            core.setFailed("✗ Error: No options provided!")
            showHelpText()
            return
        }

        /** @type {incorrectKeys} */
        let keyOutput = {}
        /** @type {incorrectFileName[]} */
        let fileNameOutput = []

        if (options.checkKeys) {
            core.info(`${COLORS.info}Checking key format...`)
            keyOutput = await checkLocaleKeys(options)
        }
        if (options.checkFileNames) {
            core.info(`${COLORS.info}Checking file name format...`)
            fileNameOutput = await checkLocaleFileNames(options)
        }

        if (options.checkKeys) {
            await displayKeyResults(keyOutput, options)
        }

        if (options.checkFileNames) {
            await displayFileNameResults(fileNameOutput, options)
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

/**
 * Parse the command line arguments.
 * @param {string[]} args - The command line arguments
 * @returns {options}
 */
function parseArgs(args) {
    const optionArgs = args.filter((arg) => arg.startsWith("-"))
    const languageArgs = args.filter((arg) => !arg.startsWith("-"))
    /** @type {options} */
    const options = {
        checkKeys: false,
        checkFileNames: false,
        verbose: false,
        languages: [],
    }

    for (const arg of optionArgs) {
        switch (arg) {
            case "-k":
            case "--keys":
                options.checkKeys = true
                break
            case "-f":
            case "--filenames":
                options.checkFileNames = true
                break
            case "-v":
            case "--verbose":
                options.verbose = true
                break
            default:
                core.setFailed(`Unknown option: ${arg}`)
                showHelpText()
                process.exit()
        }
    }

    const validLanguages = getLanguageCodes()
    for (const language of languageArgs) {
        if (!validLanguages.includes(language)) {
            core.setFailed(`Invalid language: ${language}`)
            process.exit()
        }
        options.languages.push(language)
    }
    if (options.languages.length === 0) {
        // get all languages if none are specified
        options.languages = getLanguageCodes()
    }
    return options
}

/**
 * Display the results for the key format check.
 * @param {incorrectKeys} result - The incorrect keys found.
 */
function displayKeyResults(result, options) {
    core.info(`${COLORS.info}Key Result:`)
    if (Object.keys(result).length > 0) {
        core.setFailed("Found incorrect keys")
        // Log incorrect keys per language
        for (const languageCode of options.languages) {
            const incorrectKeysForLang = Object.entries(result).filter(
                ([path]) => path.includes(`/${languageCode}/`)
            )
            const incorrectKeysCount = incorrectKeysForLang.reduce(
                (sum, [_, val]) => sum + val.length,
                0
            )
            const color = incorrectKeysCount > 0 ? COLORS.red : COLORS.green
            core.startGroup(`${color}Result for ${languageCode}`)
            core.info(
                `${color}${languageCode}: ${incorrectKeysCount} incorrect keys`
            )
            // log all incorrect keys for the language
            displayIncorrectKeys(
                languageCode,
                Object.fromEntries(incorrectKeysForLang)
            )
            core.endGroup()
        }
        const incorrectKeyCount = Object.values(result).reduce(
            (sum, val) => sum + val.length,
            0
        )
        core.setFailed(
            `✗ Found ${incorrectKeyCount} incorrect keys in ${options.languages.length} languages.`
        )
    } else {
        core.info(`${COLORS.green}✔ No incorrect keys found!`)
        process.exitCode = 0
    }
}

/**
 * Display the results for the file name format check.
 * @param {incorrectFileName[]} result - The incorrect keys found.
 */
function displayFileNameResults(result, options) {
    core.info(`${COLORS.info}File Name Result:`)
    if (result.length > 0) {
        core.setFailed("Found incorrect file names")
        // Log incorrect file names per language
        for (const languageCode of options.languages) {
            const incorrectFileNamesForLang = result.filter((fileName) =>
                fileName.incorrectFileName.includes(`/${languageCode}/`)
            )
            console.log(incorrectFileNamesForLang)
            const color =
                incorrectFileNamesForLang.length > 0 ? COLORS.red : COLORS.green

            core.startGroup(`${color}Result for ${languageCode}`)
            core.info(
                `${color}${languageCode}: ${incorrectFileNamesForLang.length} incorrect file names`
            )
            displayIncorrectFileNames(languageCode, incorrectFileNamesForLang)
            core.endGroup()
        }
        const incorrectFileNameCount = result.length
        core.setFailed(
            `✗ Found ${incorrectFileNameCount} incorrect file names in ${options.languages.length} languages.`
        )
    } else {
        core.info(`${COLORS.green}✔ No incorrect file names found!`)
        process.exitCode = 0
    }
}

/**
 * Display the incorrect keys for a language.
 * @param {string} languageCode - The language code.
 * @param {incorrectKeys} incorrectKeysForLang - The incorrect keys for the language.
 */
function displayIncorrectKeys(languageCode, incorrectKeysForLang) {
    if (Object.keys(incorrectKeysForLang).length <= 0) {
        return
    }
    for (const [filePath, incorrectKeys] of Object.entries(
        incorrectKeysForLang
    )) {
        if (!filePath.includes(`/${languageCode}/`)) {
            continue
        }
        // log the filepath
        core.info(`${COLORS.file}File: ${filePath}`)
        for (const incorrectKey of incorrectKeys) {
            core.info(
                `${COLORS.red}Incorrect key found at line ${incorrectKey.line}: ${incorrectKey.incorrectKey}`
            )
            core.info(
                `${COLORS.corrected}Correct key: ${incorrectKey.correctedKey}`
            )
        }
    }
}

/**
 * Display the incorrect keys for a language.
 * @param {string} languageCode - The language code.
 * @param {incorrectFileName[]} incorrectFileNamesForLang - The incorrect file names for the language.
 */
function displayIncorrectFileNames(languageCode, incorrectFileNamesForLang) {
    if (incorrectFileNamesForLang.length <= 0) {
        return
    }
    for (const incorrectFileName of incorrectFileNamesForLang) {
        if (
            !incorrectFileName.incorrectFileName.includes(`/${languageCode}/`)
        ) {
            continue
        }
        core.info(
            `${COLORS.red}Incorrect file name: ${incorrectFileName.incorrectFileName}`
        )
        core.info(
            `${COLORS.corrected}Correct file name: ${incorrectFileName.correctedFileName}`
        )
    }
}

main()
