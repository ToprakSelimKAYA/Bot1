const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// Bot aktif olduğunda
client.once('clientReady', () => {
    console.log(`Bot aktif: ${client.user.tag}`);
});

// Slash Komutlarını Tanımlama
const commands = [
    new SlashCommandBuilder()
        .setName('sunucukur')
        .setDescription('Rolplay sunucu altyapısını otomatik kurar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('rol-menu-kur')
        .setDescription('Rol seçim butonlarının bulunduğu menüyü kurar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

client.on('ready', async () => {
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

// Komut Çalıştırma ve Etkileşimler
client.on('interactionCreate', async interaction => {
    // 1. Slash Komutları
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        if (commandName === 'sunucukur') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: 'Bu komutu kullanmak için Yönetici yetkin olmalı!', ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            try {
                const guild = interaction.guild;

                // Rolleri Oluştur
                const duyuruRol = await guild.roles.create({ name: '📢 Duyuru Ping', color: '#ffcc00', reason: 'Rol menüsü için' });
                const icRol = await guild.roles.create({ name: '🎭 IC Duyuru Ping', color: '#00ffcc', reason: 'Rol menüsü için' });

                // Kategoriler ve Kanallar
                const bilgiKategori = await guild.channels.create({ name: '📌 BİLGİLENDİRME', type: 4 });
                await guild.channels.create({ name: 'kurallar', type: 0, parent: bilgiKategori.id });
                await guild.channels.create({ name: 'rol-al', type: 0, parent: bilgiKategori.id });

                const rpKategori = await guild.channels.create({ name: '🏙️ ROLPLAY ALANI', type: 4 });
                await guild.channels.create({ name: 'ic-genel', type: 0, parent: rpKategori.id });
                await guild.channels.create({ name: 'ooc-sohbet', type: 0, parent: rpKategori.id });

                await interaction.editReply({ content: '✅ Sunucu altyapısı ve roller başarıyla kuruldu!' });
            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: '❌ Kurulum sırasında bir hata oluştu!' });
            }
        } 
        
        else if (commandName === 'rol-menu-kur') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: 'Bu komutu kullanmak için Yönetici yetkin olmalı!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('🎭 Rol Seçim Menüsü')
                .setDescription('Sunucudaki duyurulardan haberdar olmak istiyorsan aşağıdaki butonları kullanabilirsin!\n\n• **📢 Duyuru Ping:** Sunucu duyurularını alırsın.\n• **🎭 IC Duyuru Ping:** Oyun içi (IC) olaylardan haberdar olursun.')
                .setColor('#5865F2');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('rol_duyuru')
                    .setLabel('📢 Duyuru Ping')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('rol_ic')
                    .setLabel('🎭 IC Duyuru Ping')
                    .setStyle(ButtonStyle.Success),
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: '✅ Rol seçim menüsü başarıyla gönderildi!', ephemeral: true });
        }
    }

    // 2. Buton Etkileşimleri (Rol Ver / Al)
    if (interaction.isButton()) {
        const member = interaction.member;
        
        // Rol isimlerine göre eşleştirme (Sunucundaki rol isimleriyle birebir aynı olmalı)
        let roleName = '';
        if (interaction.customId === 'rol_duyuru') roleName = '📢 Duyuru Ping';
        if (interaction.customId === 'rol_ic') roleName = '🎭 IC Duyuru Ping';

        if (roleName) {
            const role = interaction.guild.roles.cache.find(r => r.name === roleName);
            if (!role) {
                return interaction.reply({ content: `❌ "${roleName}" adında bir rol bulunamadı! Önce /sunucukur komutunu çalıştırdığından emin ol.`, ephemeral: true });
            }

            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                await interaction.reply({ content: `Successfully removed the **${roleName}** role!`, ephemeral: true });
            } else {
                await member.roles.add(role);
                await interaction.reply({ content: `Successfully added the **${roleName}** role!`, ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
