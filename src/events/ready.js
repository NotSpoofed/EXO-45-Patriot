const { Events } = require('discord.js');
const { chalk, loadValue, info_, error_, action_, reaction_ } = require('../functions.js');

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
                        console.error(error_(), 'Could not fetch battalion menu channel for guild:', chalk.green(guildId));
                    }
                }
            } catch (error) {
                console.error(error_(), 'Battalion menu channel ID is missing for guild:', chalk.green(guildId));
            }

            // Fetch existing timezone menu channel
            try {
                if (timezoneMenuChannel) {
                    const channel = bot.channels.cache.get(timezoneMenuChannel);
                    if (channel) {
                        existingChannels.push(channel);
                    } else {
                        console.error(error_(), 'Could not fetch timezone menu channel for guild:', chalk.green(guildId));
                    }
                }
            } catch (error) {
                console.error(error_(), 'Timezone menu channel ID is missing for guild:', chalk.green(guildId));
            }

            // Fetch existing battalion menu message
            try {
                if (battalionMenuMessage) {
                    const message = await existingChannels[0].messages.fetch(battalionMenuMessage);
                    if (message) {
                        existingMessages.push(message);
                    } else {
                        console.error(error_(), 'Could not fetch battalion menu message for guild:', chalk.green(guildId));
                    }
                }
            } catch (error) {
                console.error(error_(), 'Battalion menu message ID is missing for guild:', chalk.green(guildId));
            }

            // Fetch existing timezone menu message
            try {
                if (timezoneMenuMessage) {
                    const message = await existingChannels[1].messages.fetch(timezoneMenuMessage);
                    if (message) {
                        existingMessages.push(message);
                    } else {
                        console.error(error_(), 'Could not fetch timezone menu message for guild:', chalk.green(guildId));
                    }
                }
            } catch (error) {
                console.error(error_(), 'Timezone menu message ID is missing for guild:', chalk.green(guildId));
            }

            // Fetch the commands for the guild
            const guild = bot.guilds.cache.get(guildId);
            if (!guild) return;

            try {
                const reactionRoles = await guild.commands.create({
                    name: 'reactionrole',
                    description: 'Manage reaction role menus',
                    options: [
                        {
                            name: 'menu',
                            description: 'Name of the reaction role menu',
                            type: 3, // INTEGER type
                            required: true,
                            choices: [
                                { name: 'Battalions', value: 'battalions' },
                                { name: 'Timezones', value: 'timezones' }
                            ]
                        },
                        // Add more options here if needed
                    ],
                });
                const clear = await guild.commands.create({
                    name: 'clear',
                    description: 'Clear a certain amount of messages.',
                    options: [
                        {
                            name: 'amount',
                            description: 'Choose an amount 1-100',
                            type: 4,
                            required: true
                        }
                    ]
                });
                const level = await guild.commands.create({
                    name: 'level',
                    description: 'Set your current level',
                    options: [
                        {
                            name: 'rank',
                            description: 'Choose a level between 1-50',
                            type: 4,
                            required: true
                        }
                    ]
                });
                console.log(info_(), `Slash command registered in guild "${chalk.magenta(guild.name)}": ${chalk.green(`${reactionRoles.name}, ${clear.name}, ${level.name}`)}`);
            } catch (error) {
                console.error(error_(), `Failed to register slash command in guild "${guild.name}":`, error);
            }

            // Fetch all guild users
            try {
                await guild.members.fetch();
                console.log(info_(), `Fetched all guild users for guild "${chalk.magenta(guild.name)}"`);
            } catch (error) {
                console.error(error_(), `Failed to fetch guild users for guild "${guild.name}":`, error);
            }

            for (const message of existingMessages) {
                try {
                    const reactions = await message.reactions.cache.each(async (reaction) => {
                        const users = await reaction.users.fetch();
                    });
                } catch (error) {
                    console.error(error_(), `Error fetching reactions for message: ${error}`);
                    continue;
                }
            }
        }));
    }
}