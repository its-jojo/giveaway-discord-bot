exports.run = async (client, message, args) => {

    // If the member doesn't have enough permissions
    if(!message.member.permissions.has('MANAGE_MESSAGES') && !message.member.roles.cache.some((r) => r.name === "Giveaways")){
        return message.reply(':x: Du hast nicht die nötigen Rechte um ein Giveaway zu beenden.');
    }

    // If no message ID or giveaway name is specified
    if(!args[0]){
        return message.reply(':x: Das ist keine Gültige Nachrichten ID!');
    }

    // try to found the giveaway with prize then with ID
    let giveaway = 
    // Search with giveaway prize
    client.giveawaysManager.giveaways.find((g) => g.prize === args.join(' ')) ||
    // Search with giveaway ID
    client.giveawaysManager.giveaways.find((g) => g.messageId == args[0]);

    // If no giveaway was found
    if(!giveaway){
        return message.reply('Es konnte kein Giveaway gefunden werden für `'+ args.join(' ') + '`.');
    }

    // Edit the giveaway
  client.giveawaysManager.end(giveaway.messageId)
    // Success message
    .then(() => {
        // Success message
        message.reply('Giveaway wurde beendet.');
    }).catch((e) => {
            message.reply({
                content: e
            });
    })

};
