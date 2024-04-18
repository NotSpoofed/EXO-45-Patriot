const { SlashCommandBuilder } = require('@discordjs/builders');
const { muteCommand } = require('../../config.json');
const { log } = require('../console/chalk.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a player.')
        .addUserOption(option =>
            option.setName('player')
                .setDescription('The player you want to mute.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const roleIds = muteCommand;
        const { guildId } = interaction;
        const user = interaction.options.getUser('player');
        const guildName = bot.guilds.cache.get(guildId).name;
        const roleToAdd = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');

         if (interaction.member && interaction.member.roles) {
            const hasRole = roleIds.some(roleId => interaction.member.roles.cache.has(roleId));

            if (hasRole) {

                if (!roleToAdd) {
                    return interaction.reply({ content: 'The "Muted" role was not found on this server.', ephemeral: true });
                }

                const member = interaction.guild.members.cache.get(user.id);

                if (!member) {
                    return interaction.reply({ content: 'User not found.', ephemeral: true });
                }

                // Check if the member already has the role
                if (member.roles.cache.has(roleToAdd.id)) {
                    return interaction.reply({ content: `${user.username} is already muted.`, ephemeral: true });
                }

                try {
                    await member.roles.add(roleToAdd);
                    log('action', guildName, `${user.username} has been muted by ${interaction.user.username}`);
                    await interaction.reply({ content: `${user.username} has been muted.`, ephemeral: true });
                } catch (error) {
                    console.error('Error occurred while muting user:', error);
                    await interaction.reply({ content: 'There was an error while muting the user.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: `You do not have permission to use this command!`, ephemeral: true });
            }
        }
    },
};
