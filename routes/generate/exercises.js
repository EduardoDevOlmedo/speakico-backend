import { getAudio } from "./generateAudioFiles.js";
import { PrismaClient } from "../../generated/prisma-client/client.js";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

let storedPhrases = [];

const API_KEY = process.env.GEMINI_API_KEY;

export async function generateExercises(req, res) {
    const { interests, level, userId } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            targetLanguage: true,
        }
    });

    const prompt = `
    You are a tool that generates phrases in ${user.targetLanguage === 'es' ? "Spanish" : "English"}.
    The student is a native ${user.targetLanguage === "en" ? "Spanish" : "English"} speaker who is learning ${user.targetLanguage === "es" ? "Spanish" : "English"}, 
    so the phrases must sound natural in ${user.targetLanguage === "en" ? "Spanish" : "English"} but be suitable for someone whose first language is ${user.targetLanguage === "en" ? "English" : "Spanish"}.
    

    TASK:
    - Avoid repeating phrases, if exists, in previous exercises: ${storedPhrases.join(", ")}.
    - Generate EXACTLY 3 short, natural phrases in ${user.targetLanguage} (max 10 words each, depending on the level).
    - Target level: ${level}
    - Consider the student's interests: ${interests}
    - The phrases must be everyday, conversational ${user.targetLanguage}.
    - The phrases must be suitable for the target level.
    - Have a variety of phrases, not just the same ones.
    - Output ONLY the 3 phrases, separated by semicolons, like this:
    frase uno; frase dos; frase tres
    - No numbers, bullets, translations, explanations, or extra punctuation (no periods, commas, etc.).
    - There must be exactly 2 semicolons in the output.
    `.trim();

    console.log(prompt);

    try {
        const { phrases, audioUrls } = await generateContent(prompt, level, user.id, user.targetLanguage);
        console.log(phrases);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                level: level,
                interests: interests,
            }
        });

        res.status(200).json({
            exercises: phrases.map((phrase, idx) => ({
                phrase,
                audio: audioUrls[idx]
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message || "Error generating exercises" });
    }
}

async function generateContent(promptText, level, userId) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

    storedPhrases = [];

    const body = {
        contents: [
            {
                parts: [
                    { text: promptText }
                ]
            }
        ]
    };

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": API_KEY
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error en la API de GoogleGemini: ${errorText}`);
    }

    const data = await res.json();
    const phrases = data.candidates[0].content.parts[0].text
        .split(";")
        .map(phrase => phrase.trim())
        .filter(Boolean);

    storedPhrases.push(...phrases);

    const audioData = await getAudio(phrases, level, userId);


    return {
        phrases,
        audioUrls: audioData.urls
    };
}
