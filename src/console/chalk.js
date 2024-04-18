const chalk = require('../../node_modules/chalk');

function log(type, guild, message) {

    let prefix;

    switch(type) {

        case 'warn':
            prefix = chalk.yellow('[') + chalk.yellow(chalk.bold('Warning')) + chalk.yellow(']');
            break;
        case 'error':
            prefix = chalk.red('[') + chalk.red(chalk.bold('Error')) + chalk.red(']');
            break;
        case 'info':
            prefix = chalk.green('[') + chalk.green(chalk.bold('Info')) + chalk.green(']');
            break;
        case 'action':
            prefix = chalk.cyan('[') + chalk.cyan(chalk.bold('Action')) + chalk.cyan(']');
            break;

    }

    console.log(`${prefix} ${chalk.yellow(chalk.bold(guild))} : ${message}`);
}

module.exports = { log };