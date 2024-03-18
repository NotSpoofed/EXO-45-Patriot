const { Client } = require('discord.js');
const chalk = require('../node_modules/chalk');
const fs = require('fs');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function info_() {
    return chalk.green('[') + chalk.green(chalk.bold('Info')) + chalk.green(']');
}

function error_() {
    return chalk.yellow('[') + chalk.yellow(chalk.bold('Warn')) + chalk.yellow(']');
}

function action_() {
    return chalk.cyan('[') + chalk.cyan(chalk.bold('Action')) + chalk.cyan(']');
}

function reaction_() {
    return chalk.cyan('[') + chalk.cyan(chalk.bold('Reaction')) + chalk.cyan(']');
}

function saveValue(guildId, battalionMenuChannel, battalionMenuMessage, timezoneMenuChannel, timezoneMenuMessage ) {
    let data = {};
    try {
        data = JSON.parse(fs.readFileSync('./src/data.json', 'utf8'));
    } catch (err) {
        // File does not exist or is empty
    }

    // Initialize guild data if not already present
    if (!data[guildId]) {
        data[guildId] = {};
    }

    // Update only non-null values
    if (battalionMenuChannel !== null) {
        data[guildId].battalionMenuChannel = battalionMenuChannel;
    }
    if (battalionMenuMessage !== null) {
        data[guildId].battalionMenuMessage = battalionMenuMessage;
    }
    if (timezoneMenuChannel !== null) {
        data[guildId].timezoneMenuChannel = timezoneMenuChannel;
    }
    if (timezoneMenuMessage !== null) {
        data[guildId].timezoneMenuMessage = timezoneMenuMessage;
    }

    fs.writeFileSync('./src/data.json', JSON.stringify(data));
}

// Function to load a value from a file
function loadValue(guildId) {
    try {
        const fileContent = fs.readFileSync('./src/data.json', 'utf8');
        if (!fileContent) return null; // Return null if file is empty
        const lines = fileContent.split('\n');
        for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines
            const json = JSON.parse(line);
            if (json.hasOwnProperty(guildId)) {
                return json[guildId];
            }
        }
        return null;
    } catch (err) {
        console.error(error_(), 'Error loading value:', err);
        return null;
    }
}

// Function to clear the saved value for a specific menu
function clearValue(all, guildId, menuName) {
    try {
        let data = JSON.parse(fs.readFileSync('./src/data.json', 'utf8'));
        if (data[guildId]) {
            if (all) {
                data[guildId] = {}; // Clear all menu values
            } else {
                if (menuName === 'battalions') {
                    delete data[guildId].battalionMenuChannel;
                    delete data[guildId].battalionMenuMessage;
                } else if (menuName === 'timezones') {
                    delete data[guildId].timezoneMenuChannel;
                    delete data[guildId].timezoneMenuMessage;
                }
            }

            fs.writeFileSync('./src/data.json', JSON.stringify(data));
        } else {
            console.error(error_(), 'Guild ID not found:', guildId);
        }
    } catch (err) {
        console.error(error_(), 'Error clearing value:', err);
    }
}

// Function to delete a message based on its ID
async function deleteMessage(channel, message, guildName) {

    if (!channel.id) {
        console.error(error_(), 'Invalid channel ID found while deleting message');
        return;
    }

    try {
        if (!message.id) {
            console.error(error_(), 'Invalid message ID found while deleting message');
            return;
        }

        await message.delete();
        console.log(action_(), chalk.magenta(guildName), `Deleted menu with ID: ${chalk.green(message.id)}`);

    } catch (error) {
        console.error(error_(), 'Error deleting message:', err);
    }
}

module.exports = { chalk, saveValue, loadValue, clearValue, deleteMessage, delay, info_, error_, action_, reaction_ };

//TODO
// SlashCommands Handler
// Set level command
// logs