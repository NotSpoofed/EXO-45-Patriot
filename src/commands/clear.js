const { chalk, info_, error_, action_, reaction_ } = require('../functions.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { permissions } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear a certain amount of messages.'),
    options: [
        {
            name: 'amount',
            description: 'Choose an amount 1-100',
            type: 4,
            required: true
        }
    ],
    async execute(interaction) {
        if (interaction.member && interaction.member.roles) {
            const { options, user } = interaction;
            const channel = bot.channels.cache.get(interaction.channel.id);
            const roleIds = permissions;
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
    }
};