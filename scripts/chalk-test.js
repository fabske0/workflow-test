import chalk from 'chalk';

console.log("---Chalk---")
console.log(chalk.blue('Hello world!'));
console.log(chalk.red('Hello world!'));
console.log(chalk.green('Hello world!'));
console.log(chalk.yellow('Hello world!'));
console.log(chalk.magenta('Hello world!'));
console.log(chalk.cyan('Hello world!'));
console.log(chalk.white('Hello world!'));
console.log(chalk.gray('Hello world!'));
console.log(chalk.black('Hello world!'));

console.log("------------")
console.log(`\x1b[31mHello world!\x1b[0m\n`);