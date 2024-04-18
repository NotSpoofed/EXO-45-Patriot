const { Events } = require('discord.js');
const { battalions, timezones } = require('../../config.json');
const { handleRoleAdd, handleRoleRemove } = require('../events.js');

// Define a cooldown map to track users on cooldown
const cooldowns = new Map();

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        // Check if the updated member is the guild owner, and skip if true
        if (newMember.guild.ownerId === newMember.user.id) {
            return;
        }

        // Check if the user is on cooldown
        if (cooldowns.has(newMember.id)) {
            return;
        }

        // Add the user to cooldown
        cooldowns.set(newMember.id, true);

        // Remove the user from cooldown after a delay
        setTimeout(() => {
            cooldowns.delete(newMember.id);
        }, 5000); // 5-second cooldown

        // Wait for a short delay to ensure cache is updated
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Retrieve old and new roles
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        // Find roles added and removed
        const rolesAdded = newRoles.filter(role => !oldRoles.has(role.id));
        const rolesRemoved = Array.from(oldRoles.values()).filter(role => !newRoles.has(role.id));

        // Get the guild name
        const guildName = newMember.guild.name;

        // Define a logger function for logging role changes
        const logger = (action, role, member) => {
            //console.log(action, `${role.name} role has been ${action === 'added' ? 'added to' : 'removed from'} ${member.user.username} in ${guildName}.`);
        };

        // Process roles removed
        for (const role of rolesRemoved.values()) {
            // Find the role in the battalion list
            const battalionRole = battalions.find(r => r.name === role.name);
            if (battalionRole) {
                try {
                    // Call handleRoleRemove
                    await handleRoleRemove(newMember, battalionRole, guildName);
                    logger('removed', battalionRole, newMember);
                } catch (error) {
                    //console.error('Error handling role:', error);
                }
            }
        }

        // Process roles added
        for (const role of rolesAdded.values()) {
            // Find the role in the battalion list
            const battalionRole = battalions.find(r => r.name === role.name);
            if (battalionRole) {
                try {
                    // Call handleRoleAdd
                    await handleRoleAdd(newMember, battalionRole, guildName);
                    logger('added', battalionRole, newMember);
                } catch (error) {
                    //console.error('Error handling role:', error);
                }
            }
        }
    }
};
