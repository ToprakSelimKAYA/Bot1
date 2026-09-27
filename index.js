const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

client.once('ready', async () => {
    console.log(`Bot aktif: ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('sunucukur')
            .setDescription('TuranRP tarzı örnek kanal ve kategori şablonunu kurar.')
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Komutlar sunucuya kaydediliyor...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Komut başarıyla yüklendi!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'sunucukur') {
        await interaction.reply({ content: '⚙️ Sunucu şablonu (Görsellerdeki düzene göre) kuruluyor, lütfen bekleyin...', ephemeral: true });

        const guild = interaction.guild;

        try {
            // 1. Rolleri Oluşturalım
            await guild.roles.create({ name: '👑 Kurucu / Yönetim', color: 'Red', permissions: [PermissionsBitField.Flags.Administrator] });
            await guild.roles.create({ name: '🛡️ Yetkili', color: 'Blue' });
            await guild.roles.create({ name: '👤 Oyuncu', color: 'Green' });

            // 2. BİLGİLENDİRME & DUYURULAR KATEGORİSİ
            const bilgiKategori = await guild.channels.create({
                name: '📌 BİLGİLENDİRME & DUYURULAR',
                type: 4, 
            });

            await guild.channels.create({ name: '📢 | duyuru', type: 0, parent: bilgiKategori });
            await guild.channels.create({ name: '🚨 | erlc-duyuru', type: 0, parent: bilgiKategori });
            await guild.channels.create({ name: '📻 | ic-duyuru', type: 0, parent: bilgiKategori });
            await guild.channels.create({ name: '📜 | kurallar', type: 0, parent: bilgiKategori });
            await guild.channels.create({ name: '🎨 | rol-terimleri', type: 0, parent: bilgiKategori });
            await guild.channels.create({ name: '🚩 | bilgilendirme', type: 0, parent: bilgiKategori });
            await guild.channels.create({ name: '🎗️ | rol-al', type: 0, parent: bilgiKategori });
            await guild.channels.create({ name: '📊 | sosyal-medya-ekibi', type: 0, parent: bilgiKategori });
            await guild.channels.create({ name: '🏅 | başarımlar', type: 0, parent: bilgiKategori });

            // 3. TOPLULUK & ETKİNLİK KATEGORİSİ
            const toplulukKategori = await guild.channels.create({
                name: '💬 TOPLULUK & ETKİNLİK',
                type: 4,
            });

            await guild.channels.create({ name: '💬 · sohbet', type: 0, parent: toplulukKategori });
            await guild.channels.create({ name: '🤖 · bot-komut', type: 0, parent: toplulukKategori });
            await guild.channels.create({ name: '📸 · medya', type: 0, parent: toplulukKategori });
            await guild.channels.create({ name: '💭 · istek-öneri', type: 0, parent: toplulukKategori });
            await guild.channels.create({ name: '📷 · fotoğraf-yarışması', type: 0, parent: toplulukKategori });
            await guild.channels.create({ name: '🎥 · video-yarışması', type: 0, parent: toplulukKategori });

            // 4. SES ODALARI KATEGORİSİ
            const sesKategori = await guild.channels.create({
                name: 'SES ODALARI',
                type: 4,
            });

            await guild.channels.create({ name: '📻 · frekans-belirle', type: 0, parent: sesKategori });
            await guild.channels.create({ name: '🔒 · oda-oluştur', type: 0, parent: sesKategori });

            await guild.channels.create({ name: '🎙️ | Sohbet Odası ¹', type: 2, parent: sesKategori });
            await guild.channels.create({ name: '🎙️ | Sohbet Odası ²', type: 2, parent: sesKategori });
            await guild.channels.create({ name: '🎙️ | Sohbet Odası ³', type: 2, parent: sesKategori });
            await guild.channels.create({ name: '🔊 | Roleplay Ses ¹', type: 2, parent: sesKategori });
            await guild.channels.create({ name: '🔊 | Roleplay Ses ²', type: 2, parent: sesKategori });
            await guild.channels.create({ name: '🔊 | Roleplay Ses ³', type: 2, parent: sesKategori });
            await guild.channels.create({ name: '🔊 | Roleplay Ses ⁴', type: 2, parent: sesKategori });

            await interaction.editReply({ content: '✅ Gönderdiğin ekran görüntülerindeki tüm kanal ve kategoriler başarıyla oluşturuldu!' });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Kurulum sırasında bir hata oluştu. Botun sunucuda "Yönetici" yetkisine sahip olduğundan emin ol!' });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
