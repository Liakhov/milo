export async function downloadTelegramFile(filePath: string): Promise<Buffer> {
    const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
}
