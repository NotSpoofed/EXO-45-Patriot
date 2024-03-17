const { EmbedBuilder, Messages, MessageManager } = require('discord.js');
const { saveValue, clearValue, delay, info_, error_, action_, reaction_ } = require('./functions.js');
const config = require('../config.json');
const chalk = require('../node_modules/chalk');
const { SlashCommandBuilder } = require('@discordjs/builders');

async function reactRoles(channel, message, menuName) {
    let roles = [];
    if (menuName === 'battalions') {
        roles = config.battalions.map(b => b.emoji);
    } else if (menuName === 'timezones') {
        roles = config.timezones.map(t => t.emoji);
    }

    if (!channel) return console.error(error_(), 'Invalid menu channel');
    if (!message) return console.error(error_(), 'Invalid menu message');

    for (const role of roles) {
        try {
            await message.react(role);
        } catch (err) {
            console.error(error_(), 'Failed to react:', err);
        }
    }
}

async function battalionMenu(channel, guildId, guildName, menuName) {
    let title = config.battalionEmbed.title;
    let description = config.battalionEmbed.description;
    let color = config.battalionEmbed.color;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);

    const newChannel = channel;
    const message = await newChannel.send({ embeds: [embed] });

    console.log(action_(), chalk.magenta(guildName),`Created menu with ID: ${chalk.green(message.id)}`);
    saveValue(guildId, newChannel.id, message.id, null, null);

    setTimeout(() => {
        reactRoles(newChannel, message, menuName);
    }, 1000);
}

async function timezoneMenu(channel, guildId, guildName, menuName) {
    let title = config.timezoneEmbed.title;
    let description = config.timezoneEmbed.description;
    let color = config.timezoneEmbed.color;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);

    const newChannel = channel;
    const message = await newChannel.send({ embeds: [embed] });

    console.log(action_(), chalk.magenta(guildName),`Created menu with ID: ${chalk.green(message.id)}`);
    saveValue(guildId, null, null, newChannel.id, message.id);

    setTimeout(() => {
        reactRoles(newChannel, message, menuName);
    }, 1000);
}

async function reactionRoleMenu(menuInstance, channel, interaction, guildId, guildName, menuName, message) {

    if (message) {
        await interaction.editReply({ content: `Creating **${menuName}** reaction role menu!`, ephemeral: true });
    } else if (!message && interaction){
        await interaction.reply({ content: `Creating **${menuName}** reaction role menu!`, ephemeral: true });
    }
    switch (menuName) {
        case 'battalions':
            if (!menuInstance) {
                await battalionMenu(channel, guildId, guildName, menuName);
                return;
            }

            if (menuInstance) {
                await clearValue(false, guildId);
                await battalionMenu(channel, guildId, guildName, menuName);
                return;
            }
            break;
        case 'timezones':
            if (!menuInstance) {
                await timezoneMenu(channel, guildId, guildName, menuName);
                return;
            }

            if (menuInstance) {
                await clearValue(false, guildId);
                await timezoneMenu(channel, guildId, guildName, menuName);
                return;
            }
            break;
        // Add more cases here
        default:
            break;
    }
}

// Reaction functions

module.exports = { reactionRoleMenu };