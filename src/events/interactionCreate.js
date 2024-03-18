const { Events } = require('discord.js');
const { reactionRoleMenu } = require('../reactionroles.js');
const { battalions, timezones, permissions } = require('../../config.json');
const { loadValue, clearValue, deleteMessage, delay, chalk, info_, error_, action_, reaction_ } = require('../functions.js');

const commandCooldowns = new Map();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}
