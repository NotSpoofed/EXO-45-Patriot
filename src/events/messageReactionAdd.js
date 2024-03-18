const { Events } = require('discord.js');
const config = require('../../index.js');
const { loadValue, chalk, info_, error_, action_, reaction_ } = require('../functions.js');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (user.bot) return; // Ignore reactions from bots

        const message = reaction.message;
        const guild = message.guild;
        const member = await guild.members.fetch(user.id);
        const emoji = reaction.emoji.name;
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
                console.error(error_(), `Role for emoji "${chalk.cyan(emoji)}" not found.`);
                return;
            }

            const roleName = role.name;
            const roleObj = guild.roles.cache.find(r => r.name === roleName);

            if (!roleObj) {
                console.error(error_(), `Role "${chalk.cyan(roleName)}" not found.`);
                return;
            }

            try {
                // Remove all other roles and reactions
                if (message.reactions && message.reactions.cache) {
                    // Iterate over reactions and remove user's previous reactions
                    message.reactions.cache.forEach(async (messageReaction) => {
                        if (messageReaction.users.cache.has(user.id) && messageReaction.emoji.name !== emoji) {
                            await messageReaction.users.remove(user.id);
                        }
                    });

                    // Add the selected role
                    await member.roles.add(roleObj.id);
                    console.log(reaction_(), `Added role "${chalk.cyan(roleName)}" to ${chalk.yellow(user.tag.capitalize())}.`);
                } else {
                    console.error(error_(), `Message reactions not available.`);
                }
            } catch (error) {
                console.error(error_(), `Failed to add/remove roles for ${chalk.yellow(user.tag.capitalize())}: ${error}`);
            }
        }
    }
}