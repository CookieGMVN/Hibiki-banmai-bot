const DIG = require("br");

module.exports = {
  name: "stonks",
  description: "Stock meme but có mặt của bạn :v",
  usage: "stonks <user>",
  category: "fun",
  run: async (client, message, args) => {
    const Member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;
    let avatar2 = Member.user.displayAvatarURL();
    let img = await new DIG.Stonk().getImage(avatar2.replace("webp","png"));
    let attach = new client.discord.MessageAttachment(img, "delete.png");
    message.channel.send(attach);
  }
};
