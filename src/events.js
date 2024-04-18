const { Client } = require('discord.js');

async function handleRoleAdd(member, role, guildName) {
    const privateRole = member.guild.roles.cache.find(r => r.name === 'Private');
    const recruitRole = member.guild.roles.cache.find(r => r.name === 'Recruit');
    let newNickname;

    if (member.user.globalName) {
        newNickname = `${role.prefix} ${member.user.globalName}`;
    } else {
        newNickname = `${role.prefix} ${member.user.username}`;
    }

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
    }
}

async function handleRoleRemove(member, role) {
    const privateRole = member.guild.roles.cache.find(r => r.name === 'Private');
    const recruitRole = member.guild.roles.cache.find(r => r.name === 'Recruit');
    let newNickname;

    if (member.user.globalName) {
        newNickname = member.user.globalName;
    } else {
        newNickname = member.user.username;
    }

    await member.setNickname(newNickname);

    if (privateRole) {
        await member.roles.remove(privateRole);
    }

    if (recruitRole) {
        await member.roles.add(recruitRole);
    }
}

module.exports = { handleRoleAdd, handleRoleRemove };


module.exports = { handleRoleAdd, handleRoleRemove };