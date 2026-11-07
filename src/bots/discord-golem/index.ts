// index.ts
// このファイルを実行する

// 必要なライブラリを読み込む
import {Client, Events, GatewayIntentBits, type Role, type TextChannel} from 'discord.js';
import * as toml from 'smol-toml';
import fs from 'fs';
import * as keywordVerifier from './modules/keywordVerifier.ts';
import type { Config } from './type.ts';

// クライアントを作成
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
    ]
});

// Configを読み込む関数
function loadConfig(): Config {
    const configContent = fs.readFileSync('./config.toml', 'utf8');
    return toml.parse(configContent) as Config;
}

let config: Config;
try {
    config = loadConfig();
} catch (error) {
    console.error('Configの読み込み中にエラーが発生しました:', error);
    throw error; // エラーが発生した場合は処理を中断
}

const settings = {
    ...config,
    verification: {
        ...config.verification,
        keywordRegex: new RegExp(config.verification.keyword),
    },
};

// Botのトークンを環境変数から取得
const token = process.env.DISCORD_GOLEM_TOKEN;

if (!token) {
    console.error('DISCORD_GOLEM_TOKENが設定されていません。');
    process.exit(1);
}

// ロールを保存する変数
let role: Role | null = null;
// ログチャンネルを保存する変数
let log_channel: TextChannel | null = null;

// メッセージが送信されたときの処理
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return; // Botのメッセージは無視
    if (!message.guild) return; // DMの場合は無視
    // メッセージを処理(keywordVerifier.js)
    await keywordVerifier.validateKeyword(
        message,
        settings.verification.keywordRegex,
        role,
        settings.verification.introduction_channel_id,
        settings.verification.dm_message_wrong,
        settings.verification.dm_message_correct,
        log_channel
    );
});

// Botが起動したときの処理
client.once(Events.ClientReady, readyClient => {
    console.log(`${readyClient.user.tag}でログインしました。`);
    // ロールを取得
    const guild = readyClient.guilds.cache.first();
    if (guild) {
        role = guild.roles.cache.get(settings.verification.role_id) ?? null;
        log_channel = guild.channels.cache.get(settings.general.log_channel_id) as TextChannel | undefined ?? null;
    }
    if (log_channel == null) {
        console.error('ログチャンネルが見つかりません。');
    }
    if (role == null) {
        console.error('ロールが見つかりません。');
    }
});

// Botを起動
client.login(token).catch(error => {
    console.error('ログイン中にエラーが発生しました:', error);
});
