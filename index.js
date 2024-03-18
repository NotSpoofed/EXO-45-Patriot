const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { info_, error_, action_, reaction_ } = require('./src/functions.js');
const { token } = require('./config.json');
const path = require('node:path');
const fs = require('node:fs');

global.bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
});

global.bot.login(token);

function loadConfig() {
    try {
        const configFile = fs.readFileSync('./config.json', 'utf8');
        return JSON.parse(configFile);
    } catch (err) {
        console.error(error_(), 'Error loading config:', err);
        process.exit(1); // Exit the process if config loading fails
    }
}

const config = loadConfig();
module.exports = config;

const eventsPath = path.join(__dirname, './src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args));
    } else {
        bot.on(event.name, (...args) => event.execute(...args));
    }
}

bot.commands = new Collection();

const commandsPath = path.join(__dirname, './src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        bot.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Created the capitalize() function
Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

//TODO CLEAN UP - MOVE ALL EVENTS TO EVENTS DIR
//TODO MOVE COMMANDS TO COMMANDS DIR