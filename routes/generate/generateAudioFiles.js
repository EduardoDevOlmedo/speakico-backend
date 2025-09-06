export const getAudio = async (phrases, level, userId) => {
    if (!userId) throw new Error("userId is required");

    const headers = {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    };

    const api = `${process.env.ELEVEN_LABS_API_URL}/text-to-speech/${process.env.ELEVEN_LABS_VOICE_ID}?output_format=mp3_44100_128`;

    const speed = level === "basic" ? 0.7 : level === "intermediate" ? 0.8 : level === "advanced" ? 0.9 : 1.0;

    const audioUrls = [];

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

        const arrayBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString("base64");

        // Use a data URL for direct playback
        const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;
        audioUrls.push(dataUrl);
    }

    return {
        userId,
        urls: audioUrls,
    };
};
