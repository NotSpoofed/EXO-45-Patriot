const { loadValue, clearValue, deleteMessage, delay } = require('../functions.js');
const { reactionRoleMenu } = require('../reactionroles.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { reactionRoleCommand } = require('../../config.json');
const { log } = require('../console/chalk.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Create a reaction role menu.')
        .addStringOption(option =>
    option.setName('menu')
        .setDescription('Choose a menu.')
        .setRequired(true)
        .addChoices(
        { name: 'Battalions', value: 'battalions' },
        { name: 'Timezones', value: 'timezones' }
    )),
    async execute(interaction) {
        const { options, guildId } = interaction;
        const { battalionMenuChannel, battalionMenuMessage, timezoneMenuChannel, timezoneMenuMessage } = loadValue(guildId) || {};
        const guildName = bot.guilds.cache.get(guildId).name;
        const channel = bot.channels.cache.get(interaction.channel.id);
        const roleIds = reactionRoleCommand;
        if (interaction.member && interaction.member.roles) {
            const hasRole = roleIds.some(roleId => interaction.member.roles.cache.has(roleId));
            if (hasRole) {
                let menuName = options.getString('menu');
                let menuInstance;
                let menuChannel;

                if (menuName === 'battalions') {
                    menuInstance = battalionMenuMessage;
                    menuChannel = battalionMenuChannel;
                } else if (menuName === 'timezones') {
                    menuInstance = timezoneMenuMessage;
                    menuChannel = timezoneMenuChannel;
                }

                if (!menuInstance && !menuChannel) {
                    reactionRoleMenu(menuInstance, channel, interaction, guildId, guildName, menuName, false);
                    commandExecutionPromise = Promise.resolve();
                } else {
                    let channel_ = bot.channels.cache.get(menuChannel);
                    try {
                        let message = await channel_.messages.fetch(menuInstance);
                        if (message) {
                            await deleteMessage(channel_, message, guildName);
                            reactionRoleMenu(menuInstance, channel, interaction, guildId, guildName, menuName, false);
                            commandExecutionPromise = Promise.resolve();
                        }
                    } catch (error) {
                        log('warn', guildName, `Menu has been deleted or does not exist!`);
                        await interaction.reply({ content: 'An error has occurred. Resolving error.', ephemeral: true });
                        await clearValue(true);
                        await delay(1000);
                        await reactionRoleMenu(menuInstance, channel, interaction, guildId, guildName, menuName, true);
                        commandExecutionPromise = Promise.resolve();
                    }
                }
            } else {
                await interaction.reply({ content: `You do not have permission to use this command!`, ephemeral: true });
            }
        }
    }
}