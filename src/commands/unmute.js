const { SlashCommandBuilder } = require('@discordjs/builders');
const { muteCommand } = require('../../config.json');
const { log } = require('../console/chalk.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a player.')
        .addUserOption(option =>
            option.setName('player')
                .setDescription('The player you want to unmute.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const roleIds = muteCommand;
        const { guildId } = interaction;
        const user = interaction.options.getUser('player');
        const guildName = bot.guilds.cache.get(guildId).name;
        const roleToRemove = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');

        if (interaction.member && interaction.member.roles) {
            const hasRole = roleIds.some(roleId => interaction.member.roles.cache.has(roleId));

            if (hasRole) {

                if (!roleToRemove) {
                    return interaction.reply({ content: 'The "Muted" role was not found on this server.', ephemeral: true });
                }

                const member = interaction.guild.members.cache.get(user.id);

                if (!member) {
                    return interaction.reply({ content: 'User not found.', ephemeral: true });
                }

                // Check if the member doesn't have the role
                if (!member.roles.cache.has(roleToRemove.id)) {
                    return interaction.reply({ content: `${user.username} is not muted.`, ephemeral: true });
                }

                try {
                    await member.roles.remove(roleToRemove);
                    log('action', guildName, `${user.username} has been unmuted by ${interaction.user.username}`);
                    await interaction.reply({ content: `${user.username} has been unmuted.`, ephemeral: true });
                } catch (error) {
                    //console.error('Error occurred while unmuting user:', error);
                    await interaction.reply({ content: 'There was an error while unmuting the user.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: `You do not have permission to use this command!`, ephemeral: true });
            }
        }
    }
};
