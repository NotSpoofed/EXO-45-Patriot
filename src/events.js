const { Client } = require('discord.js');
const { chalk, info_, error_, action_, reaction_ } = require('./functions.js');

async function handleRoleAdd(member, role, guildName) {
    let privateRole = member.guild.roles.cache.find(r => r.name === 'Private');
    let recruitRole = member.guild.roles.cache.find(r => r.name === 'Recruit');
    let level = 1; // Assume level 1 for now
    let newNickname = `${role.prefix} ${member.user.username.capitalize()} | ${'LVL '} ${level}`;

    if (newNickname.length > 32) {
        newNickname = newNickname.substring(0, 32); // Truncate the nickname if it's too long
    }

    await member.setNickname(newNickname);

    if (privateRole) {
        await member.roles.add(privateRole);
    }

    if (recruitRole) {
        await member.roles.remove(recruitRole);
    }

    const channel = bot.channels.cache.get(role.channelID);
    if (channel) {
        await channel.send(`Welcome <@${member.user.id}> to the ${role.name}!`);
        console.log(action_(), chalk.magenta(guildName), `Welcome message succesfully sent in ${chalk.cyan(channel.name)}!`);
    } else {
        console.error(error_(), "Channel not found");
    }
}

async function handleRoleRemove(member, role) {
    let privateRole = member.guild.roles.cache.find(r => r.name === 'Private');
    let recruitRole = member.guild.roles.cache.find(r => r.name === 'Recruit');
    const newNickname = member.user.username.capitalize();

    await member.setNickname(newNickname);

    if (privateRole) {
        await member.roles.remove(privateRole);
    }

    if (recruitRole) {
        await member.roles.add(recruitRole);
    }
}

module.exports = { handleRoleAdd, handleRoleRemove };