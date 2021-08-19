const discord = require("discord.js");
const { Random } = require("something-random-on-discord");

module.exports = {
  name: "punch",
  category: "fun",
  aliases: ["đấm"],
  args: true,
  usage: 'punch <@user hoặc ID>',
  description: "Đấm ai đó",
  run: async (client, message, args) => {
    
    let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
   
    let data = await Random.getAnimeImgURL("punch");
    
    let embed = new discord.MessageEmbed()
    .setImage(data)
    .setColor("RANDOM")
    .setFooter(`${message.author.username} Đã đấm ${target.user.username}`)
    .setTimestamp()
    
    message.channel.send(embed);
  }
};