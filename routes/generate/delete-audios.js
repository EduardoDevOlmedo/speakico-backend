import fs from "fs/promises";

export const deleteAllAudios = async (req, res) => {
    const audioDir = `./output_audio`;
    await fs.rm(audioDir, { recursive: true });
    res.status(200).json({ message: "Audios deleted successfully" });
}