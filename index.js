const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const { log } = require('./src/console/chalk.js');
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
        //console.error(error_(), 'Error loading config:', err);
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

const commands = new Collection();

const commandsPath = path.join(__dirname, './src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        commands.set(command.data.name, command);
        log('info', guildId, `Registered slash command [ ${command.data.name} ]`);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

module.exports = commands;

const rest = new REST().setToken(token);

// Set commands function
async function setCommands(clientId, guildId, token) {
    const rest = new REST().setToken(token);
    try {
        // Delete all existing commands
        if (guildId) {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
            console.log('Successfully deleted all guild commands.');
        } else {
            await rest.put(Routes.applicationCommands(clientId), { body: [] });
            console.log('Successfully deleted all application commands.');
        }

        // Set new commands
        await rest.put(
            guildId
            ? Routes.applicationGuildCommands(clientId, guildId)
            : Routes.applicationCommands(clientId),
            { body: commands.map(command => command.data.toJSON()) },
        );

        console.log('Successfully set application commands.');
    } catch (error) {
        console.error('Error setting application commands:', error);
    }
}

setCommands(clientId, guildId, token);

// Created the capitalize() function
Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});