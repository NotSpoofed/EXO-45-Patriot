const { SlashCommandBuilder } = require('@discordjs/builders');
const { battalions, timezones, ranks } = require('../../config.json');
const { log } = require('../console/chalk.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Customize your nickname!')
        .addIntegerOption(option =>
    option.setName('level')
        .setDescription('Choose a level between 1-150 / 0 = none')
        .setRequired(true)
    )
        .addBooleanOption(option =>
    option.setName('rank')
        .setDescription('Include position?')
        .setRequired(true)
    ),
    async execute(interaction) {
        const { options, user } = interaction;
        const level = options.getInteger('level');
        const includePosition = options.getBoolean('rank');
        const guild = interaction.guild;
        const member = await guild.members.fetch(user.id);
        const userRoles = member.roles.cache;

        // Find the role prefixes and suffixes based on user's roles
        // || timezones.find(r => userRoles.some(role => role.name === r.name)) - PREVIOUS CODE
        // || ranks.find(r => userRoles.some(role => role.name === r.name)); - PREVIOUS CODE
        const rolePrefix = battalions.find(r => userRoles.some(role => role.name === r.name));
        // || timezones.find(r => userRoles.some(role => role.name === r.name)) - PREVIOUS CODE
        // || battalions.find(r => userRoles.some(role => role.name === r.name)); - PREVIOUS CODE
        const roleSuffix = ranks.find(r => userRoles.some(role => role.name === r.name));

        // Check if user is in a battalion
        const battalionRole = battalions.find(r => userRoles.some(role => role.name === r.name))?.name;
        const rankRole = ranks.find(r => userRoles.some(role => role.name === r.name))?.name;

        let newNickname;

        if (guild.ownerId === user.id) {
            await interaction.reply({ content: `I cannot change your nickname!`, ephemeral: true });
            return;
        }

        if (!battalionRole) {
            await interaction.reply({ content: `You are not in a battalion!`, ephemeral: true });
            return;
        }
        if (includePosition === true && !rankRole) {
            await interaction.reply({ content: `You do not hold a rank. \n*If you believe this is a mistake make sure you have the **private** role or higher.*`, ephemeral: true });
            return;
        }

        // Determine new nickname based on level and includePosition
        if (level < 0 || level > 50) {
            await interaction.reply({ content: `Please choose a number between **1** and **50**`, ephemeral: true });
            return;
        }

        let nicknameParts = [rolePrefix.prefix];
        if (includePosition) {
            nicknameParts.push(roleSuffix.suffix);
        }

        if (member.user.globalName) {
            nicknameParts.push(member.user.globalName);
        } else {
            nicknameParts.push(member.user.username);
        }


        if (level !== 0) {
            nicknameParts.push(`| LVL ${level}`);
        }

        newNickname = nicknameParts.join(' ');

        // Truncate the nickname if it's too long
        if (newNickname.length > 32) {
            newNickname = newNickname.substring(0, 32);
        }

        // Set the new nickname and send a success message
        await member.setNickname(newNickname);
        await interaction.reply({ content: `Nickname has successfully been changed!`, ephemeral: true });
    }
}