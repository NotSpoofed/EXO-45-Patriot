const { Events } = require('discord.js');
const { log } = require('../console/chalk.js');
const { loadValue } = require('../functions.js');
const commands = require('../../index.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(bot) {
        const guildIds = Array.from(bot.guilds.cache.keys());

        return Promise.all(guildIds.map(async (guildId) => {
            // Fetch the reactionMenu channel and message for each guild
            const { battalionMenuChannel, battalionMenuMessage, timezoneMenuChannel, timezoneMenuMessage } = loadValue(guildId) || {};

            const existingChannels = [];
            const existingMessages = [];

            // Fetch existing battalion menu channel
            try {
                if (battalionMenuChannel) {
                    const channel = bot.channels.cache.get(battalionMenuChannel);
                    if (channel) {
                        existingChannels.push(channel);
                    } else {
                        //console.error(error_(), 'Could not fetch battalion menu channel for guild:', chalk.green(guildId));
                    }
                }
            } catch (error) {
                //console.error(error_(), 'Battalion menu channel ID is missing for guild:', chalk.green(guildId));
            }

            // Fetch existing timezone menu channel
            try {
                if (timezoneMenuChannel) {
                    const channel = bot.channels.cache.get(timezoneMenuChannel);
                    if (channel) {
                        existingChannels.push(channel);
                    } else {
                        //console.error(error_(), 'Could not fetch timezone menu channel for guild:', chalk.green(guildId));
                    }
                }
            } catch (error) {
                //console.error(error_(), 'Timezone menu channel ID is missing for guild:', chalk.green(guildId));
            }

            // Fetch existing battalion menu message
            try {
                if (battalionMenuMessage) {
                    const message = await existingChannels[0].messages.fetch(battalionMenuMessage);
                    if (message) {
                        existingMessages.push(message);
                    } else {
                        //console.error(error_(), 'Could not fetch battalion menu message for guild:', chalk.green(guildId));
                    }
                }
            } catch (error) {
                //console.error(error_(), 'Battalion menu message ID is missing for guild:', chalk.green(guildId));
            }

            // Fetch existing timezone menu message
            try {
                if (timezoneMenuMessage) {
                    const message = await existingChannels[1].messages.fetch(timezoneMenuMessage);
                    if (message) {
                        existingMessages.push(message);
                    } else {
                        //console.error(error_(), 'Could not fetch timezone menu message for guild:', chalk.green(guildId));
                    }
                }
            } catch (error) {
                //console.error(error_(), 'Timezone menu message ID is missing for guild:', chalk.green(guildId));
            }

            // Fetch the commands for the guild
            const guild = bot.guilds.cache.get(guildId);
            if (!guild) return;

            // Fetch all guild users
            await guild.members.fetch();

            for (const message of existingMessages) {
                try {
                    const reactions = await message.reactions.cache.each(async (reaction) => {
                        const users = await reaction.users.fetch();
                    });
                } catch (error) {
                    //console.error(error_(), `Error fetching reactions for message: ${error}`);
                }
            }
        }));
    }
}