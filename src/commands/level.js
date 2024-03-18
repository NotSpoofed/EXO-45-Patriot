const { chalk, info_, error_, action_, reaction_ } = require('../functions.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { battalions, timezones } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Change the level in your username.'),
    options: [
        {
            name: 'rank',
            description: 'Choose a level between 1-50',
            type: 4,
            required: true
        }
    ],
    async execute(interaction) {
        const { options, user } = interaction;
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
    }
}