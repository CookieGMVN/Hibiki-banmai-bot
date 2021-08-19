const Discord = require("discord.js");

const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "emojis",
  category: "misc",
  description: "Hiển thị tất cả emoji của server, Thường không hoạt động nếu server có quá nhiều emoji",
  aliases: ["emojilist"],
  usage: "emojis",
  botPermission: ["MANAGE_EMOJIS"],
  run: async (bot, message, args, cha) => {
    message.delete();

    try {
      let Emojis = "";
      let EmojisAnimated = "";
      let EmojiCount = 0;
      let Animated = 0;
      let OverallEmojis = 0;
      function Emoji(id) {
        return bot.emojis.cache.get(id).toString();
      }

      message.guild.emojis.cache.forEach(emoji => {
        OverallEmojis++;
        if (emoji.animated) {
          Animated++;
          EmojisAnimated += Emoji(emoji.id);
        } else {
          EmojiCount++;
          Emojis += Emoji(emoji.id);
        }
      });

      let emn = new Discord.MessageEmbed();
      emn.setTitle(`Emojis của server [ ${message.guild.name} ]`);
      emn.setColor("GREEN");
      emn.setThumbnail(
        message.guild.iconURL({ dynamic: true, format: "png", size: 512 })
      );
      emn.setDescription(
        `**Animated [${Animated}]**
${EmojisAnimated}
**Standard [${EmojiCount}]**
${Emojis}`
      );
      emn.setColor("BLUE");
      message.channel.send(emn);
    } catch (err) {
      if (err)
        return message.channel.send(
          `Đã có lỗi, nguyên nhân là: ${err.message}`
        );
    }
  }
};
