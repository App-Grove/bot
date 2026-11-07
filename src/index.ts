import { fork } from 'node:child_process';

const bots = {
    'Discord Golem': './bots/discord-golem/index.ts',
} satisfies Record<string, string>;

for (const [name, scriptPath] of Object.entries(bots)) {
    const child = fork(scriptPath, {
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    child.stdout?.on('data', (data: Buffer) => {
        process.stdout.write(`[${name}] ${data.toString()}`);
    });

    child.stderr?.on('data', (data: Buffer) => {
        process.stderr.write(`[${name} ERROR] ${data.toString()}`);
    });
}
