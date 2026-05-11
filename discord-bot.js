import dotenv from 'dotenv';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Events } from 'discord.js';
import { validateLicense } from './license-store.js';
import { resolveDownloadUrlForValidatedUser } from './resolve-download.js';

dotenv.config();

const requiredEnv = ['DISCORD_BOT_TOKEN', 'DISCORD_CLIENT_ID', 'DISCORD_GUILD_ID', 'DOWNLOAD_TOKEN_SECRET'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify your purchase license and receive the launcher download link.')
    .addStringOption((option) =>
      option
        .setName('email')
        .setDescription('Email used during purchase')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('license')
        .setDescription('License key from your receipt')
        .setRequired(true)
    ),
].map((command) => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
  console.log('Registering Discord slash commands...');
  await rest.put(
    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
    { body: commands }
  );
  console.log('Slash commands registered.');
}

async function createDownloadLink(email, license) {
  const downloadUrl = await resolveDownloadUrlForValidatedUser({ email, license });
  if (!downloadUrl) {
    return null;
  }
  return downloadUrl;
}

async function handleLicenseVerification(email, license) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedLicense = String(license).trim();
  const record = await validateLicense(normalizedEmail, normalizedLicense);
  if (!record) {
    return { ok: false, message: 'License not found or invalid. Confirm the email and key from your receipt.' };
  }

  const downloadUrl = await createDownloadLink(normalizedEmail, normalizedLicense);
  if (!downloadUrl) {
    return { ok: false, message: 'Download is not configured on the server. Contact support.' };
  }

  return { ok: true, downloadUrl };
}

client.once(Events.ClientReady, async () => {
  console.log(`Discord bot logged in as ${client.user?.tag}`);
  try {
    await registerCommands();
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName !== 'verify') return;

  const email = interaction.options.getString('email', true).trim();
  const license = interaction.options.getString('license', true).trim();

  await interaction.deferReply({ ephemeral: true });
  const result = await handleLicenseVerification(email, license);

  if (!result.ok) {
    await interaction.editReply({ content: result.message });
    return;
  }

  await interaction.editReply({
    content: `✅ License verified. Download your launcher here: ${result.downloadUrl}`,
  });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  if (!content.toLowerCase().startsWith('!verify ')) return;

  const parts = content.split(/\s+/);
  if (parts.length < 3) {
    await message.reply('Usage: `!verify email license`. Example: `!verify you@example.com ABCD-1234-EFGH-5678`');
    return;
  }

  const email = parts[1].trim();
  const license = parts[2].trim();
  const result = await handleLicenseVerification(email, license);

  if (!result.ok) {
    await message.reply(result.message);
    return;
  }

  await message.reply(`✅ License verified. Download your launcher here: ${result.downloadUrl}`);
});

client.login(process.env.DISCORD_BOT_TOKEN).catch((error) => {
  console.error('Failed to log in to Discord:', error);
  process.exit(1);
});
