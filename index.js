const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { clearValue, loadValue, deleteMessage, delay, info_, error_, action_, reaction_ } = require('./src/functions.js');
const { token, guild, battalions, timezones, permissions } = require('./config.json');
const { handleRoleAdd, handleRoleRemove } = require('./src/events.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { reactionRoleMenu } = require('./src/reactionroles.js');
const chalk = require('chalk');
const fs = require('fs');

let config;
try {
    const configFile = fs.readFileSync('./config.json', 'utf8');
    config = JSON.parse(configFile);
} catch (err) {
    console.error(error_(), 'Error loading config:', err);
    process.exit(1); // Exit the process if config loading fails
}

// Created the capitalize() function
Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

global.bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
});

global.bot.login(token);

bot.on('ready', async () => {
    const guildIds = bot.guilds.cache.keys();

    for (const guildId of guildIds) {
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
        if (!guild) continue;

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
    }
});

bot.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (newMember.guild.ownerId === newMember.user.id) {
        console.log(info_(), chalk.yellow(newMember.user.username.capitalize()), 'is the guild owner, no action taken.');
        return;
    }

    // Wait for a short delay to ensure cache is updated
    await new Promise(resolve => setTimeout(resolve, 1000));

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const rolesAdded = newRoles.filter(role => !oldRoles.has(role.id));
    const rolesRemoved = Array.from(oldRoles.values()).filter(role => !newRoles.has(role.id));

    const guildName = newMember.guild.name;

    for (const roleAdded of rolesAdded.values()) {
        const role = battalions.find(r => r.name === roleAdded.name) || timezones.find(r => r.name === roleAdded.name);
        if (role) {
            await handleRoleAdd(newMember, role, guildName);
            console.log(action_(), `${chalk.cyan(role.name)} role has successfully been added to ${chalk.yellow(newMember.user.username.capitalize())}!`);
        }
    }

    for (const roleRemoved of rolesRemoved) {
        const role = battalions.find(r => r.name === roleRemoved.name) || timezones.find(r => r.name === roleRemoved.name);
        if (role) {
            await handleRoleRemove(newMember, role);
            console.log(action_(), `${chalk.cyan(role.name)} role has successfully been removed from ${chalk.yellow(newMember.user.username.capitalize())}!`);
        }
    }
});

const commandCooldowns = new Map();

bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options, guildId, user } = interaction;
    const { battalionMenuChannel, battalionMenuMessage, timezoneMenuChannel, timezoneMenuMessage } = loadValue(guildId) || {};
    const guildName = bot.guilds.cache.get(guildId).name;
    const channel = bot.channels.cache.get(interaction.channel.id);
    const roleIds = permissions;

    // Check if command has a cooldown
    if (commandCooldowns.has(commandName)) {
        const cooldownEndTime = commandCooldowns.get(commandName);
        if (Date.now() < cooldownEndTime) {
            console.log('Command is on cooldown');
            await interaction.reply({ content: 'Command is on cooldown', ephemeral: true });
            return;
        }
    }

    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Command execution timed out'));
        }, 3000); // 3 seconds timeout
    });

    let commandExecutionPromise;

    switch(commandName) {
        case 'reactionrole':
            // Make sure interaction.member is defined and has the roles property
            if (interaction.member && interaction.member.roles) {
                const hasRole = roleIds.some(roleId => interaction.member.roles.cache.has(roleId));
                if (hasRole) {
                    let menuName = options.getString('menu');
                    let menuInstance;
                    let menuChannel;

                    console.log(info_(), `Received menu name: ${chalk.green(menuName)}`);

                    if (menuName === 'battalions') {
                        menuInstance = battalionMenuMessage;
                        menuChannel = battalionMenuChannel;
                    } else if (menuName === 'timezones') {
                        menuInstance = timezoneMenuMessage;
                        menuChannel = timezoneMenuChannel;
                    }

                    if (!menuInstance && !menuChannel) {
                        reactionRoleMenu(menuInstance, channel, interaction, guildId, guildName, menuName);
                        commandExecutionPromise = Promise.resolve();
                    } else {
                        let channel_ = bot.channels.cache.get(menuChannel);
                        try {
                            let message = await channel_.messages.fetch(menuInstance);
                            if (message) {
                                await deleteMessage(channel_, message, guildName);
                                reactionRoleMenu(menuInstance, channel, interaction, guildId, guildName, menuName);
                                commandExecutionPromise = Promise.resolve();
                            }
                        } catch (error) {
                            console.error(error_(), 'Error fetching or deleting message:', error.message);
                            await interaction.reply({ content: 'An error has occurred. Resolving error.', ephemeral: true });
                            await clearValue(true);
                            await delay(1000);
                            await reactionRoleMenu(menuInstance, channel, interaction, guildId, guildName, menuName);
                            commandExecutionPromise = Promise.resolve();
                        }
                    }
                } else {
                    await interaction.reply({ content: `You do not have permission to use this command!`, ephemeral: true });
                }
            }
            break;
        case 'clear':
            // Make sure interaction.member is defined and has the roles property
            if (interaction.member && interaction.member.roles) {
                const hasRole = roleIds.some(roleId => interaction.member.roles.cache.has(roleId));
                if (hasRole) {
                    let amount_ = options.getInteger('amount');
                    if (amount_ > 100 || amount_ < 1) {
                        await interaction.reply({ content: `Please choose a number between **1** and **100**`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: `Deleted ${amount_} message(s)`, ephemeral: true });
                        console.log(action_(), `${chalk.yellow(interaction.user.tag.capitalize())} has deleted ${amount_} messages.`);
                        let messages = await channel.messages.fetch({ limit: amount_ });
                        await channel.bulkDelete(messages);
                    }
                    commandExecutionPromise = Promise.resolve();
                } else {
                    await interaction.reply({ content: `You do not have permission to use this command!`, ephemeral: true });
                }
            }
            break;
        case 'level':
            const level = options.getInteger('rank');
            const guild = interaction.guild;
            const member = await guild.members.fetch(user.id);
            const userRoles = member.roles.cache;
            const rolePrefix = battalions.find(r => userRoles.some(role => role.name === r.name)) || timezones.find(r => userRoles.some(role => role.name === r.name));
            const roleName = battalions.concat(timezones).find(r => userRoles.some(role => role.name === r.name))?.name;

            if (roleName) {
                if (level > 50 || level < 1) {
                    await interaction.reply({ content: `Please choose a number between **1** and **50**`, ephemeral: true });
                } else {
                    let newNickname = `${rolePrefix.prefix} ${member.user.username.capitalize()} | ${'LVL '} ${level}`;

                    if (newNickname.length > 32) {
                        newNickname = newNickname.substring(0, 32); // Truncate the nickname if it's too long
                    }

                    await member.setNickname(newNickname);
                    await interaction.reply({ content: `Your level has been set to ${level}!`, ephemeral: true });
                    commandExecutionPromise = Promise.resolve();
                }
            } else {
                await interaction.reply({ content: `You are not in a battalion!`, ephemeral: true });
            }
            break;
    }

    commandExecutionPromise = Promise.race([timeoutPromise, commandExecutionPromise]);

    commandExecutionPromise.catch((error) => {
        console.error('Command execution timed out:', error.message);
        interaction.reply({ content: 'Command execution timed out', ephemeral: true }).catch(console.error);
    });

    // Set cooldown for the command
    const cooldownTime = 3000; // 3 seconds cooldown
    commandCooldowns.set(commandName, Date.now() + cooldownTime);
});

bot.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return; // Ignore reactions from bots

    const message = reaction.message;
    const guild = message.guild;
    const member = await guild.members.fetch(user.id);
    const emoji_ = reaction.emoji.name;
    const allEmojis = config.battalions.map(b => b.emoji).concat(config.timezones.map(t => t.emoji));
    const { battalionMenuChannel, battalionMenuMessage, timezoneMenuChannel, timezoneMenuMessage } = loadValue(guild.id) || {};

    // Check if the reaction is on one of the menu messages
    if (
    (message.channel.id === battalionMenuChannel && message.id === battalionMenuMessage) ||
    (message.channel.id === timezoneMenuChannel && message.id === timezoneMenuMessage)
    ) {
        // Find the role corresponding to the emoji
        const role = config.battalions.find(b => b.emoji === emoji_) || config.timezones.find(t => t.emoji === emoji_);

        if (!role) {
            console.error(error_(), `Role for emoji "${chalk.cyan(emoji_)}" not found.`);
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
                    if (messageReaction.users.cache.has(user.id) && messageReaction.emoji.name !== emoji_) {
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
});

bot.on('messageReactionRemove', async (reaction, user) => {
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
            // Remove the role
            await member.roles.remove(roleObj.id);
            console.log(reaction_(), `Removed role "${chalk.cyan(roleName)}" from ${chalk.yellow(user.tag.capitalize())}.`);
        } catch (error) {
            console.error(error_(), `Failed to remove role "${chalk.cyan(roleName)}" from ${chalk.yellow(user.tag.capitalize())}: ${error}`);
        }
    }
});




