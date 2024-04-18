const { SlashCommandBuilder } = require('@discordjs/builders');
const { clearCommand } = require('../../config.json');
const { log } = require('../console/chalk.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear a certain amount of messages.')
        .addIntegerOption(option =>
    option.setName('amount')
        .setDescription('Choose an amount 1-100')
        .setRequired(true)
    ),
    async execute(interaction) {
        if (interaction.member && interaction.member.roles) {
            const { options, user } = interaction;
            const channel = bot.channels.cache.get(interaction.channel.id);
            const roleIds = clearCommand;
            const hasRole = roleIds.some(roleId => interaction.member.roles.cache.has(roleId));
            if (hasRole) {
                let amount_ = options.getInteger('amount');
                if (amount_ > 100 || amount_ < 1) {
                    await interaction.reply({ content: `Please choose a number between **1** and **100**`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `Deleted ${amount_} message(s)`, ephemeral: true });
                    log('action', interaction.guild.name, `${interaction.user.username.capitalize()} has deleted ${amount_} message(s) in ${channel.name}`);
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