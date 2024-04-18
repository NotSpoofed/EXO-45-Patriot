const { Events } = require('discord.js');
const config = require('../../index.js');
const { loadValue } = require('../functions.js');

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user) {
        if (user.bot) return; // Ignore reactions from bots

        const message = reaction.message;
        const guild = message.guild;
        const member = await guild.members.fetch(user.id);
        let emoji = reaction.emoji.name; // Default to Unicode emoji name

        // Check if the emoji is a custom emoji
        if (reaction.emoji.id) {
            emoji = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
        }

        const allEmojis = config.battalions.map(b => b.emoji).concat(config.timezones.map(t => t.emoji));
        const { battalionMenuChannel, battalionMenuMessage, timezoneMenuChannel, timezoneMenuMessage } = loadValue(guild.id) || {};

        // Check if the reaction is on one of the menu messages
        if (
            (message.channel.id === battalionMenuChannel && message.id === battalionMenuMessage) ||
            (message.channel.id === timezoneMenuChannel && message.id === timezoneMenuMessage)
        ) {
            // Find the role corresponding to the emoji
            const role = config.battalions.find(b => b.emoji === emoji) || config.timezones.find(t => t.emoji === emoji);

            if (!role) {
                //console.error(error_(), `Role for emoji "${chalk.cyan(emoji)}" not found.`);
                return;
            }

            const roleName = role.name;
            const roleObj = guild.roles.cache.find(r => r.name === roleName);

            if (!roleObj) {
                //console.error(error_(), `Role "${chalk.cyan(roleName)}" not found.`);
                return;
            }

            try {
                // Remove the role
                await member.roles.remove(roleObj.id);
                //console.log(reaction_(), `Removed role "${chalk.cyan(roleName)}" from ${chalk.yellow(user.tag.capitalize())}.`);
            } catch (error) {
                //console.error(error_(), `Failed to remove role "${chalk.cyan(roleName)}" from ${chalk.yellow(user.tag.capitalize())}: ${error}`);
            }
        }
    }
}
