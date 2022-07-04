const Discord = require('discord.js');
const config = require('../config.json');
module.exports.run = async (client, message, args) => {
  const select = new Discord.MessageSelectMenu().setCustomId("select").setPlaceholder("Choose a type of giveaway to view!").addOptions([
    {
      label: '🎉 Normale Giveaways',
      description: 'Sehe die normalen Giveaway die momentan laufen',
      value: 'normal',
    },
    {
      label: "⚙ Server basierte Giveaways!",
      description: "Sehe die Giveaways die mit einer Server-Mitgkieds anfordeung laufen",
      value: "guildReq"
    },
  ])
  const row = new Discord.MessageActionRow().addComponents([select])
  let giveaways = client.giveawaysManager.giveaways.filter(g => g.guildId === `${message.guild.id}` && !g.ended);
  if (!giveaways.some(e => e.messageId)) {
    return message.reply('💥Es gibt keine laufenden Giveaways')
  }
  const msg = await message.reply({ embeds: [new Discord.MessageEmbed().setDescription("Wähle eine Option um los zu legen").setColor("#2F3136").setTimestamp()], components: [row] })
  let embed = new Discord.MessageEmbed()
    .setTitle("Derzeit aktive Giveaways")
    .setColor("#2F3136")
    .setFooter(client.user.username, client.user.displayAvatarURL())
    .setTimestamp()
  let embedGuild = new Discord.MessageEmbed()
    .setTitle("Derzeit aktive Giveaways mit Beitrittsvoraussetzungen")
    .setColor("#2F3136")
    .setFooter(client.user.username, client.user.displayAvatarURL())
    .setTimestamp()

  const filter = x => x.customId == "select" && x.user.id == message.author.id
  const collector = await message.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 })
  collector.on("collect", async (i) => {
    i.update({ components: [] });
    const val = i.values[0]
    if (val == "normal") {
      await Promise.all(giveaways.map(async (x) => {
        embed.addField(`Normales Giveaway:`, `**Preis:** **[${x.prize}](https://discord.com/channels/${x.guildID}/${x.channelID}/${x.messageID})\nStarted:** <t:${((x.startAt)/1000).toFixed(0)}:R> (<t:${((x.startAt)/1000).toFixed(0)}:f>)\n**Endet in:** <t:${((x.endAt)/1000).toFixed(0)}:R> (<t:${((x.endAt)/1000).toFixed(0)}:f>)`)
      }));
     msg.edit({ embeds: [embed] })
    }
    if (val == "guildReq") {
      if (!giveaways.some(e => e.extraData)) return msg.edit({ content: '💥 Keine aktiven Giveaways', embeds: [] }).catch(e => console.error(e))
      await Promise.all(giveaways.map(async (x) => {
        if (x.extraData) {
          const guild = client.guilds.cache.get(x.extraData.server)
          const channel = guild.channels.cache
            .filter((channel) => channel.type === 'text')
            .first()
          const inv = await channel.createInvite()
          embedGuild.addField(`Beitritts gebundenes Giveaway:`, `**Preis:** **[${x.prize}](https://discord.com/channels/${x.guildID}/${x.channelID}/${x.messageID})**\n**Erfordert: [diesen Server](${inv})**\n**Angefangen:** <t:${((x.startAt)/1000).toFixed(0)}:R> (<t:${((x.startAt)/1000).toFixed(0)}:f>)\n**Endet in:** <t:${((x.endAt)/1000).toFixed(0)}:R> (<t:${((x.endAt)/1000).toFixed(0)}:f>)`)
        }
      }));
      msg.edit({ embeds: [embedGuild] })
    }
  })
  collector.on("end",(collected, reason) => {
   if(reason == "time")
   msg.edit({ content: "👀 Versuche es erneut", components: [] })
  })
}

