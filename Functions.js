//I WILL BE BACK AFTER 5 min
const { MessageEmbed, Client } = require("discord.js");
const { QUEUE_LIMIT, COLOR } = require("./config.js");
const yes = ["yes", "y", "ye", "yea", "correct"];
const no = ["no", "n", "nah", "nope", "fuck off"];
const { Database } = require("quickmongo");
const Discord = require("discord.js");
let { mongodb } = require("./config.js");
let database = new Database(mongodb);
const format = require(`humanize-duration`);
module.exports = {
  async GetRegxp(Type) {
    if (!Type || typeof Type !== "string") return null;

    if (Type === "YtID") {
      return /^[a-zA-Z0-9-_]{11}$/;
    } else if (Type === "YtUrl") {
      return /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
    } else if (Type === "YtPlID") {
      return /(PL|UU|LL|RD)[a-zA-Z0-9-_]{16,41}/;
    } else {
      return /https?:\/\/(www.)?youtube.com\/playlist\?list=((PL|UU|LL|RD)[a-zA-Z0-9-_]{16,41})/;
    }
  },
  async Linker(Type) {
    if (Type.toLowerCase() === "Base") {
      return "https://youtube.com/watch?v=";
    } else {
      return `https://youtube.com/watch?v=${Type}`;
    }
  },
  async Player(message, Discord, client, Ytdl, options = {}, db) {
    const Filters = {
      bassboost: "bass=g=20,dynaudnorm=f=200",
      vaporwave: "aresample=48000,asetrate=48000*0.8",
      nightcore: "aresample=48000,asetrate=48000*1.25",
      phaser: "aphaser=in_gain=0.4",
      treble: "treble=g=5",
      normalizer: "dynaudnorm=f=200",
      flanger: "flanger"
    };
    const Db = await client.queue.get(message.guild.id);
    let Seek;
    if (options.Filter) {
      Seek = Db.ExtraTime
        ? Db.Bot.dispatcher.streamTime + Db.ExtraTime
        : Db.Bot.dispatcher.streamTime;
    } else {
      Seek = undefined;
    }

    if (!options.Play) {
      (await Db.VoiceChannel.leave()) &&
        (await client.queue.delete(message.guild.id));
      const Embeded = new Discord.MessageEmbed()
        .setColor(options.Color)
        .setTitle("Đã phát hết hàng chờ!")
        .setDescription(
          "Hàng đợi máy chủ đã kết thúc, cảm ơn vì đã lắng nghe tôi <3"
        )
        .setTimestamp();
      return message.channel
        .send(Embeded)
        .catch(() =>
          message.channel.send(
            "Hàng đợi máy chủ đã kết thúc, cảm ơn vì đã lắng nghe tôi <3"
          )
        );
    }

    Db.Bot.on("disconnect", async () => {
      await client.queue.delete(message.guild.id);
    });

    const EcoderFilters = [];
    Object.keys(Db.Filters).forEach(FilterName => {
      if (Db.Filters[FilterName]) {
        EcoderFilters.push(Filters[FilterName]);
      }
    });
    let Encoder;
    if (EcoderFilters.length < 1) {
      Encoder = [];
    } else {
      Encoder = ["-af", EcoderFilters.join(",")];
    }

    const Steam = Ytdl(Db.Songs[0].Link, {
      filter: "audioonly",
      quality: "highestaudio",
      opusEncoded: true,
      seek: Seek / 1000,
      encoderArgs: Encoder,
      highWaterMark: 1 << 30
    });

    setTimeout(async () => {
      if (Db.Steam) Db.Steam.destroy();
      Db.Steam = Steam;

      const Dispatcher = await Db.Bot.play(Steam, {
        type: "opus",
        birate: "auto"
      });

      if (Seek) {
        Db.ExtraTime = Seek;
      } else {
        const PlayEmbed = new Discord.MessageEmbed()
          .setColor(options.Color)
          .setThumbnail(options.Play.Thumbnail)
          .setTitle("ĐANG PHÁT!")
          .setDescription(`🎶 Đang Phát: **${options.Play.Title}**`)
          .setTimestamp();

        await Db.TextChannel.send(PlayEmbed).catch(() =>
          Db.TextChannnel.send(`🎶 Đang Phát: **${options.Play.Title}**`)
        );
        Db.ExtraTime = 0;
      }

      await Dispatcher.setVolumeLogarithmic(Db.Volume / 100);

      await Db.Bot.dispatcher
        .on("finish", async () => {
          const Shift = await Db.Songs.shift();
          if (Db.Loop === true) {
            await Db.Songs.push(Shift);
          }

          await module.exports.Player(message, Discord, client, Ytdl, {
            Play: Db.Songs[0],
            Color: require("./config.js").Color
          });
        })
        .on("error", async error => {
          await console.log(error);
          return Db.TextChannel.send(
            "Error: Đã có lỗi từ phía của Bot, hãy liên lạc với <@!579566400360808459> hoặc [Kenji](https://facebook.com/kobayashikenji.126)"
          );
        });
    }, 1000);
  },
  async Objector(Song, message) {
    function FD(duration) {
      let minutes = Math.floor(duration / 60);
      let hours = "";
      if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = hours >= 10 ? hours : "0" + hours;
        minutes = minutes - hours * 60;
        minutes = minutes >= 10 ? minutes : "0" + minutes;
      }
      duration = Math.floor(duration % 60);
      duration = duration >= 10 ? duration : "0" + duration;
      if (hours != "") {
        return hours + ":" + minutes + ":" + duration;
      }
      return minutes + ":" + duration;
    }
    async function FC(Count) {
      if (Count.length === 4) {
        return `${Count[0]} Nghìn`;
      } else if (Count.length === 5) {
        return `${Count[0]}${Count[1]} Nghìn`;
      } else if (Count.length === 6) {
        return `${Count[0]}${Count[1]}${Count[2]} Nghìn`;
      } else if (Count.length === 7) {
        return `${Count[0]} Triệu`;
      } else if (Count.length === 8) {
        return `${Count[0]}${Count[1]} Triệu`;
      } else if (Count.length === 9) {
        return `${Count[0]}${Count[1]}${Count[2]} Triệu`;
      } else if (Count.length === 10) {
        return `${Count[0]} Tỷ`;
      } else if (Count.length === 11) {
        return `${Count[0]}${Count[1]} Tỷ`;
      } else if (Count.length === 12) {
        return `${Count[0]}${Count[1]}${Count[2]} Tỷ`;
      } else if (Count.length === 13) {
        return `${Count[0]} Nghìn Tỷ`;
      } else {
        return Count;
      }
    }
    return {
      ID: Song.videoId,
      Title: Song.title,
      Link: Song.video_url,
      Duration: await FD(Song.lengthSeconds),
      Seconds: Song.lengthSeconds,
      Thumbnail: Song.thumbnails[0].url,
      Author: Song.ownerChannelName,
      AuthorLink: Song.ownerProfileUrl,
      Upload: Song.uploadDate,
      Views: await FC(Song.viewCount || 0),
      Age: Song.age_restricted ? "Có" : "Không",
      Owner: message.author.username
    };
  },
  async awaitReply(message, question, limit = 60000, obj = false) {
    const filter = m => m.author.id === message.author.id;
    let con = await message.channel.send({
      embed: {
        description: question,
        color: "BLUE",
        footer: {
          text: `Thời lượng: ${format(limit)}`
        }
      }
    });
    try {
      const collected = await message.channel.awaitMessages(filter, {
        max: 1,
        time: limit,
        errors: ["Thời lượng"]
      });
      if (obj) return collected.first();
      return collected.first().content;
    } catch (e) {
      return false;
    }
  },
  async verify(
    channel,
    user,
    { time = 30000, extraYes = [], extraNo = [] } = {}
  ) {
    const filter = res => {
      const value = res.content.toLowerCase();
      return (
        (user ? res.author.id === user.id : true) &&
        (yes.includes(value) ||
          no.includes(value) ||
          extraYes.includes(value) ||
          extraNo.includes(value))
      );
    };
    const verify = await channel.awaitMessages(filter, {
      max: 1,
      time
    });
    if (!verify.size) return 0;
    const choice = verify.first().content.toLowerCase();
    if (yes.includes(choice) || extraYes.includes(choice)) return true;
    if (no.includes(choice) || extraNo.includes(choice)) return false;
    return false;
  },
  async list(arr, conj = "and") {
    const len = arr.length;
    if (len === 0) return "";
    if (len === 1) return arr[0];
    return `${arr.slice(0, -1).join(", ")}${
      len > 1 ? `${len > 2 ? "," : ""} ${conj} ` : ""
    }${arr.slice(-1)}`;
  },
  async randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  async getRandomString(length) {
    var chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var s = "";
    for (var i = 0; i < length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      s += chars.substring(rnum, rnum + 1);
    }

    return s;
  },
  async send(content, message, type, color) {
    if (!color) color = "RANDOM";
    if (type === "dm") {
      return message.author.send({
        embed: {
          author: {
            icon_url: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username
          },
          description: content,
          color: color
        }
      });
    }
    return message.channel.send({
      embed: {
        author: {
          icon_url: message.author.displayAvatarURL({ dynamic: true }),
          name: message.author.username
        },
        description: content,
        color: color
      }
    });
  },
  async emo(count) {
    const mapping = {
      " ": "  ",
      "0": ":zero:",
      "1": ":one:",
      "2": ":two:",
      "3": ":three:",
      "4": ":four:",
      "5": ":five:",
      "6": ":six:",
      "7": ":seven:",
      "8": ":eight:",
      "9": ":nine:"
    };
    let coun = count
      .split("")
      .map(c => mapping[c] || c)
      .join("");
    return coun;
  },
  async text(text) {
    const emojified = `${text}`
      .toLowerCase()
      .split("")
      .map(letter => {
        if (/[a-z]/g.test(letter)) {
          return `:regional_indicator_${letter}: `;
        }

        return letter;
      })
      .join("");
    return emojified;
  },
  async resolveUser(search) {
    if (!search || typeof search !== "string") return null;
    let user = null;
    if (search.match(/^<@!?(\d+)>$/))
      user = this.users.fetch(search.match(/^<@!?(\d+)>$/)[1]).catch(() => {});
    if (search.match(/^!?(\w+)#(\d+)$/) && !user)
      user = this.users.cache.find(
        u =>
          u.username === search.match(/^!?(\w+)#(\d+)$/)[0] &&
          u.discriminator === search.match(/^!?(\w+)#(\d+)$/)[1]
      );
    if (search.match(/.{2,32}/) && !user)
      user = this.users.cache.find(u => u.username === search);
    if (!user) user = this.users.fetch(search).catch(() => {});
    return user;
  },
  async formating(ms) {
    let days, daysms, hours, hoursms, minutes, minutesms, sec;
    days = Math.floor(ms / (24 * 60 * 60 * 1000));
    daysms = ms % (24 * 60 * 60 * 1000);
    hours = Math.floor(daysms / (60 * 60 * 1000));
    hoursms = ms % (60 * 60 * 1000);
    minutes = Math.floor(hoursms / (60 * 1000));
    minutesms = ms % (60 * 1000);
    sec = Math.floor(minutesms / 1000);

    return (
      days +
      " Ngày, " +
      hours +
      " Giờ, " +
      minutes +
      " Phút, " +
      sec +
      " Giây."
    );
  },
  async translate(text, message) {
    let language = await database.get(`LANG_${message.guild.id}`);
    let translate = require("@k3rn31p4nic/google-translate-api");
    const translated = await translate(text, {
      to: language
    });
    let send = await translated.text;
    return send;
  },
  async emoji(msg, client) {
    let emojis = msg.match(/(?<=:)([^:\s]+)(?=:)/g);
    if (!emojis) msg;
    let temp;
    if (emojis) {
      emojis.forEach(m => {
        let emoji = client.emojis.cache.find(x => x.name === m);
        if (!emoji) return;
        temp = emoji.toString();
        if (new RegExp(temp, "g").test(msg))
          msg = msg.replace(new RegExp(temp, "g"), emoji.toString());
        else
          msg = msg.replace(new RegExp(":" + m + ":", "g"), emoji.toString());
      });
    }
    return msg;
  }
};
/* let emojis = msg.match(/(?<=:)([^:\s]+)(?=:)/g);
  if (!emojis) msg;
  let temp;
  if (emojis) {
    emojis.forEach(m => {
      let emoji = client.emojis.cache.find(x => x.name === m);
      if (!emoji) return;
      temp = emoji.toString();
      if (new RegExp(temp, "g").test(msg))
        msg = msg.replace(new RegExp(temp, "g"), emoji.toString());
      else msg = msg.replace(new RegExp(":" + m + ":", "g"), emoji.toString());
    });
  }
  return msg;
}*/
