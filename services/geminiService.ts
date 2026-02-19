/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Modality, Type } from "@google/genai";
import { RouteDetails, StorySegment, StoryStyle, StoryPage } from "../types";
import { base64ToArrayBuffer, pcmToWav } from "./audioUtils";

const RAW_API_KEY = process.env.API_KEY;
const API_KEY = RAW_API_KEY ? RAW_API_KEY.replace(/["']/g, "").trim() : "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const TARGET_SEGMENT_DURATION_SEC = 60; 
const WORDS_PER_MINUTE = 145;
const WORDS_PER_SEGMENT = Math.round((TARGET_SEGMENT_DURATION_SEC / 60) * WORDS_PER_MINUTE);

export const calculateTotalSegments = (durationSeconds: number): number => {
    return Math.max(1, Math.ceil(durationSeconds / TARGET_SEGMENT_DURATION_SEC));
};

export const generateStoryImage = async (prompt: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A professional, cinematic, high-end 3D claymation style illustration: ${prompt}. Dark atmospheric lighting, premium aesthetic, similar to a high-end coffee table book illustration.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image Generation Error:", error);
  }
  return undefined;
};

export const generateStorybookPages = async (lifeContext: string): Promise<StoryPage[]> => {
  const prompt = `Create a 5-page cinematic storybook narrative based on this life summary: "${lifeContext}". 
  Each page should have a 'text' description (2-3 sentences) and a 'visualPrompt' for image generation. 
  Output valid JSON array of objects.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pageNumber: { type: Type.NUMBER },
              text: { type: Type.STRING },
              visualPrompt: { type: Type.STRING }
            },
            required: ["pageNumber", "text", "visualPrompt"]
          }
        }
      }
    });

    const pagesData = JSON.parse(response.text || "[]");
    const pages: StoryPage[] = [];

    for (const item of pagesData) {
      const imageUrl = await generateStoryImage(item.visualPrompt);
      pages.push({
        pageNumber: item.pageNumber,
        text: item.text,
        imageUrl: imageUrl
      });
    }

    return pages;
  } catch (error) {
    console.error("Storybook Generation Error:", error);
    return [];
  }
};

const getStyleInstruction = (style: StoryStyle): string => {
    switch (style) {
        case 'NOIR':
            return "Style: Noir Thriller. Gritty, cynical, atmospheric. Use inner monologue. The traveler is a detective or someone with a troubled past. The city is a character itself—dark, rainy, hiding secrets. Use metaphors of shadows, smoke, and cold neon.";
        case 'CHILDREN':
            return "Style: Children's Story. Whimsical, magical, full of wonder and gentle humor. The world is bright and alive; maybe inanimate objects (like traffic lights or trees) have slight personalities. Simple but evocative language. A sense of delightful discovery.";
        case 'HISTORICAL':
            return "Style: Historical Epic. Grandiose, dramatic, and timeless. Treat the journey as a significant pilgrimage or quest in a bygone era (even though it's modern day, overlay it with historical grandeur). Use slightly archaic but understandable language. Focus on endurance, destiny, and the weight of history.";
        case 'FANTASY':
            return "Style: Fantasy Adventure. Heroic, mystical, and epic. The real world is just a veil over a magical realm. Streets are ancient paths, buildings are towers or ruins. The traveler is on a vital quest. Use metaphors of magic, mythical creatures (shadows might be lurking beasts), and destiny.";
        default:
            return "Style: Immersive, 'in the moment' narration. Focus on the sensation of movement and the immediate environment.";
    }
};

export const generateStoryOutline = async (
    route: RouteDetails,
    totalSegments: number
): Promise<string[]> => {
    const styleInstruction = getStyleInstruction(route.storyStyle);
    const prompt = `
    You are an expert storyteller. Write an outline for a story that is exactly ${totalSegments} chapters long and has a complete cohesive story arc with a clear set up, inciting incident, rising action, climax, success, falling action, and resolution. 

    Your outline should be tailored to match this journey:

    Journey: ${route.startAddress} to ${route.endAddress} by ${route.travelMode.toLowerCase()}.
    Total Duration: Approx ${route.duration}.
    Total Narrative Segments needed: ${totalSegments}.
    
    ${styleInstruction}

    Output strictly valid JSON: An array of ${totalSegments} strings. Example: ["Chapter 1 summary...", "Chapter 2 summary...", ...]
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const text = response.text?.trim();
        if (!text) throw new Error("No outline generated.");
        
        const outline = JSON.parse(text);
        if (!Array.isArray(outline) || outline.length === 0) {
             throw new Error("Invalid outline format received.");
        }

        while (outline.length < totalSegments) {
            outline.push("Continue the journey towards the destination.");
        }

        return outline.slice(0, totalSegments);

    } catch (error) {
        console.error("Outline Generation Error:", error);
        return Array(totalSegments).fill("Continue the immersive narrative of the journey.");
    }
};

export const generateSegment = async (
    route: RouteDetails,
    segmentIndex: number,
    totalSegmentsEstimate: number,
    segmentOutline: string,
    previousContext: string = ""
): Promise<StorySegment> => {

  const isFirst = segmentIndex === 1;

  let contextPrompt = "";
  if (!isFirst) {
      contextPrompt = `
      PREVIOUS NARRATIVE CONTEXT (The story so far):
      ...${previousContext.slice(-1500)} 
      (CONTINUE SEAMLESSLY from the above. Do not repeat it. Do not start with "And so..." or similar connectors every time.)
      `;
  }

  const styleInstruction = getStyleInstruction(route.storyStyle);

  const prompt = `
    You are an AI storytelling engine generating a continuous, immersive audio stream for a traveler.
    Journey: ${route.startAddress} to ${route.endAddress} by ${route.travelMode.toLowerCase()}.
    Current Status: Segment ${segmentIndex} of approx ${totalSegmentsEstimate}.
    
    ${styleInstruction}

    CURRENT CHAPTER GOAL: ${segmentOutline}

    ${contextPrompt}

    Task: Write the next ~${TARGET_SEGMENT_DURATION_SEC} seconds of narration (approx ${WORDS_PER_SEGMENT} words) based on the Current Chapter Goal.
    Keep the narrative moving forward. This is a transient segment of a longer journey.

    IMPORTANT: Output ONLY the raw narration text for this segment. Do not include titles, chapter headings, or JSON. Just the text to be spoken.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) throw new Error("No text generated for segment.");

    return {
      index: segmentIndex,
      text: text,
      audioBuffer: null 
    };

  } catch (error) {
    console.error(`Segment ${segmentIndex} Text Generation Error:`, error);
    throw error; 
  }
};

export const generateSegmentAudio = async (text: string, audioContext: AudioContext, voiceName: string = 'Kore'): Promise<AudioBuffer> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } }
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    if (!audioData) throw new Error("No audio data received from Gemini TTS.");

    const mimeType = part?.inlineData?.mimeType || "audio/pcm;rate=24000";
    const match = mimeType.match(/rate=(\d+)/);
    const sampleRate = match ? parseInt(match[1], 10) : 24000;

    const wavArrayBuffer = await pcmToWav(base64ToArrayBuffer(audioData), sampleRate).arrayBuffer();
    return await audioContext.decodeAudioData(wavArrayBuffer);

  } catch (error) {
    console.error("Audio Generation Error:", error);
    throw error; 
  }
};