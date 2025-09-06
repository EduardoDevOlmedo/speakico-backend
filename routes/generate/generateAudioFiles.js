import fs from "fs/promises";
import path from "path";

const OUTPUT_ROOT = "./output_audio";
const BASE_AUDIO_URL = process.env.BASE_AUDIO_URL || "http://localhost:4000/audios";

export const getAudio = async (phrases, level, userId) => {
    if (!userId) throw new Error("userId is required");

    const headers = {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    };

    const api = `${process.env.ELEVEN_LABS_API_URL}/text-to-speech/${process.env.ELEVEN_LABS_VOICE_ID}?output_format=mp3_44100_128`;

    const speed =
        level === "basic" ? 0.7 :
            level === "intermediate" ? 0.8 :
                level === "advanced" ? 0.9 : 1.0;

    const userDir = path.join(OUTPUT_ROOT, userId);


    // clean up any existing audio for this user
    try {
        await fs.rm(userDir, { recursive: true, force: true });
    } catch (err) {
        console.warn(`Could not clean user folder: ${err.message}`);
    }

    await fs.mkdir(userDir, { recursive: true });

    const filePaths = [];
    const publicUrls = [];

    for (let i = 0; i < phrases.length; i++) {
        const phrase = phrases[i];

        const raw = JSON.stringify({
            text: phrase,
            model_id: "eleven_flash_v2_5",
            voice_settings: { speed },
        });

        const response = await fetch(api, {
            method: "POST",
            headers,
            body: raw,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch audio for phrase ${i + 1}: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const filename = `phrase_${i + 1}.mp3`;
        const filePath = path.join(userDir, filename);

        await fs.writeFile(filePath, Buffer.from(buffer));
        filePaths.push(filePath);

        const url = `${BASE_AUDIO_URL}/${userId}/${filename}`;
        publicUrls.push(url);
    }

    return {
        userId,
        files: filePaths,
        urls: publicUrls,
    };
};
