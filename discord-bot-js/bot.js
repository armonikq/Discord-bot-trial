const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log('Bot is online!');
});

const rawdata = fs.readFileSync('kufur.json');
const curses = JSON.parse(rawdata).curses;

const warningCounts = new Map();
const warnedUsers = new Set(); // Uyarı yapılmış kullanıcıları tutar

client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === 'genel');
  if (!channel) return;
  channel.send(`Sunucumuza hoşgeldin ${member}!`);
  channel.send('Sunucu hakkında bilgi almak için !bot yazabilirsin.');
  channel.send('Sunucu bilgilerini öğrenmek için !sunucu yazabilirsin.');
  channel.send('Sunucu kurallarını öğrenmek için !kurallar yazabilirsin.');
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const messageContent = message.content.toLowerCase();
  let warned = false;

  // kufur kısmı
  for (const curse of curses) {
    if (messageContent.includes(curse)) {
      await message.delete();
      await message.channel.send(`${message.author}, lütfen küfür etmeyin!`);
      warned = true;
      break;
    }
  }


  if (warned) {
    const userId = message.author.id;
    if (message.author.bot) return;
    // kufur kısmı
    if (!warningCounts.has(userId)) {
      warningCounts.set(userId, 1);
    } else {
      warningCounts.set(userId, warningCounts.get(userId) + 1);
    }

    if (warningCounts.get(userId) >= 3) {
      if (!warnedUsers.has(userId)) { // Kullanıcı daha önce susturulmuş mu kontrol et
        if (message.author.bot) return;
        try {
          const guildMember = await message.guild.members.fetch(message.author.id);
          if (guildMember && guildMember.moderatable) {
            await guildMember.timeout(60 * 1000); // 1 dakika timeout
            await message.channel.send(`${message.author}, 3 kez uyarıldınız, 1 dakika süreyle susturuldunuz.`);
            warningCounts.set(userId, 0); // Uyarı sayacını sıfırla
            warnedUsers.add(userId); // Kullanıcıyı susturulmuş olarak işaretle
          } else {
            await message.channel.send(`Kullanıcı ${message.author} susturulamadı.`);
          }
        } catch (error) {
          console.error('Timeout işlemi sırasında bir hata oluştu:', error);
        }
      }
    }
  }
   //reklam kontrolü.
  if (messageContent.includes('discord.gg/')) {
    await message.delete();
    await message.channel.send(`${message.author}, lütfen reklam yapmayın!`);
  } else if (messageContent.includes('http://') || messageContent.includes('https://')) {
    await message.delete();
    await message.channel.send(`${message.author}, lütfen link paylaşmayın!`);
  }

  // kullanıcı !clear yazdında bütün mesajlar silinsin.
  if (messageContent === '!clear') {
    if (message.member.permissions.has('MANAGE_MESSAGES')) {
      message.channel.messages.fetch().then(messages => {
        message.channel.bulkDelete(messages);
      });
    } else {
      message.reply('Bu komutu kullanma izniniz yok!');
    }
  }

  if (messageContent === '!kurallar') {
    message.reply('Sunucu kuralları:\n1. Küfür etmek yasaktır.\n2. Spam yapmak yasaktır.\n3. Reklam yapmak yasaktır.');
  }

  if (messageContent === 'bot' || messageContent === '!bot') {
    message.reply('Nasıl yardımcı olabilirim?');
    message.channel.send('Yardım almak için !yardım yazabilirsin.');
  }

  client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const messageContent = message.content.toLowerCase();

    // Existing code...

    if (messageContent === '!sunucu') {

      try {
        const owner = await message.guild.fetchOwner();
        message.reply(`Sunucu adı: ${message.guild.name}\nToplam üye sayısı: ${message.guild.memberCount}\nSunucu sahibi: ${owner.user.tag}`);
      } catch (error) {
        console.error('Sunucu sahibi alınırken bir hata oluştu:', error);
        message.reply('Sunucu sahibi bilgisi alınamadı.');

      }
    }
  });
  if (messageContent === '!yardım') {
    message.reply('Yardım almak için !yardım yazabilirsin.');
    message.channel.send('Sunucu bilgilerini öğrenmek için !sunucu yazabilirsin.');
    message.channel.send('Sunucu kurallarını öğrenmek için !kurallar yazabilirsin.');
  }

  client.on('messageCreate', message => {

    if (message.content === '!Genel') {
      const channel = message.guild.channels.cache.find(channel => channel.name === 'Genel');
      if (channel) {
        message.channel.send(`Bu kanala gitmek için [tıklayın](https://discord.com/channels/${message.guild.id}/${channel.id})`);
      } else {
        message.channel.send('Yeni kanal bulunamadı.');
      }
    }

  });
  client.on('messageCreate', message => {

    if (message.content === '!ses') {
      const channel = message.guild.channels.cache.find(channel => channel.name === 'ses');
      if (channel) {
        message.channel.send(`Bu kanala gitmek için [tıklayın](https://discord.com/channels/${message.guild.id}/${channel.id})`);
      } else {
        message.channel.send('Yeni kanal bulunamadı.');
      }
    }
  });
});

client.login('MTI2NjgwNDk5NDE1ODQ5Mzg1OA.Gqrm5b.elN9JuOflPbeO9_lY121_-TDZPy_-0tZ855284');
