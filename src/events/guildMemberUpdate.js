const { Events } = require('discord.js');
const { battalions, timezones } = require('../../config.json');
const { handleRoleAdd, handleRoleRemove } = require('../events.js');
const { chalk, info_, error_, action_, reaction_ } = require('../functions.js');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
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
    }
}