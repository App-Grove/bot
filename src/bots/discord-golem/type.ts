// src/discord-golem/type.ts
// 型を定義するファイル

export type Config = {
    general: {
        token: string;
        log_channel_id: string;
    };
    verification: {
        introduction_channel_id: string;
        role_id: string;
        keyword: string;
        dm_message_wrong: string;
        dm_message_correct: string;
    };
};