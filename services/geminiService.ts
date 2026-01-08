import { GoogleGenAI, Type } from "@google/genai";
import { Story } from "../types.ts";

const STORY_GENRES = [
  "Space Circus with Martian Kittens and Moon-Cheese",
  "Secret Underwater Library where fish whisper secrets",
  "Cloud-Top Bakery where pancakes fly like butterflies",
  "The Jungle of Giant Pasta and Meatball Monsters",
  "Dinosaur School where the teacher is a polite T-Rex",
  "A Time-Traveling Train that runs on Laughter",
  "The Kingdom of Sneeze Volcanoes that puff out glitter",
  "A city where the rain is made of colorful bubbles",
  "The Forest of Talking Toys looking for their batteries",
  "A brave Little Snail racing a Shooting Star"
];

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Connection failed. Check your magic spark (API Key).");
  return new GoogleGenAI({ apiKey });
};

export const generateStoryContent = async (age: number, language: 'en' | 'ar' = 'ar', heroType: string): Promise<Story> => {
  const ai = getAIClient();
  const randomGenre = STORY_GENRES[Math.floor(Math.random() * STORY_GENRES.length)];
  const isArabic = language === 'ar';
  
  const learningLang = isArabic ? "English" : "Arabic";
  const primaryLang = isArabic ? "Egyptian Arabic (Warm Cairo Ammiya)" : "English";

  const prompt = `Write an UNBELIEVABLE, CATCHY, and TOTALLY UNIQUE 6-page bedtime story for a ${age}yo child. 
    Hero: ${heroType}. Theme: ${randomGenre}.
    
    STORYTELLING RULES:
    1. HIGH ENERGY: Use playful sounds (onomatopoeia) like "Broom!", "Zap!", "تششش!", "هوووب!".
    2. CATCHY LANGUAGE: If Arabic, use rhythmic Egyptian Ammiya with playful rhyming (Saj'). Make it sound like a cool song.
    3. MAGIC SECRET: Each page MUST reveal a small discovery about nature or life (e.g., how bees dance, why the moon changes shape).
    4. ARC: Starts with high wonder, Page 3 is a funny twist, Page 6 is a warm, sleepy hug.
    5. WORDS: 15-20 words per page. Keep it punchy!
    
    JSON Schema: {
      "title": "A Catchy Rhyming Title",
      "translatedTitle": "Title in ${learningLang}",
      "magicLesson": "The big secret learned",
      "themeColor": "Vibrant Neon Hex",
      "pages": [{
        "text": "Sentences in ${primaryLang}",
        "translatedText": "Simple translation in ${learningLang}",
        "imagePrompt": "Stylized Disney 3D illustration. High contrast, magical lighting, NO TEXT.",
        "magicFact": "One-sentence 'Magic Secret' for this page"
      }]
    }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          translatedTitle: { type: Type.STRING },
          magicLesson: { type: Type.STRING },
          themeColor: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                translatedText: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                magicFact: { type: Type.STRING }
              }
            }
          }
        },
        required: ["title", "translatedTitle", "pages", "magicLesson"]
      }
    }
  });

  const parsed = JSON.parse(response.text);
  return { 
    ...parsed, 
    id: Math.random().toString(36).substring(7), 
    language, 
    age, 
    createdAt: Date.now() 
  } as Story;
};

export const generatePageImage = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  try {
    // Faster generation with prioritized descriptors
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: `Pixar 3D storybook style, high-quality, vibrant magical colors, soft cinematic glow: ${prompt}` }] 
      },
      config: { imageConfig: { aspectRatio: "9:16" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";
  } catch (err) {
    console.error("Image gen failed:", err);
    return ""; 
  }
};

export const generateNarration = async (text: string, language: 'en' | 'ar' = 'en'): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read with extreme love, playful rhythm, and a bedtime hush: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: language === 'ar' ? 'Zephyr' : 'Kore' } 
          }
        }
      }
    });
    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    return audioPart?.inlineData?.data || "";
  } catch (err) {
    return ""; 
  }
};