import type { TTSProvider } from "@/types/tts";

export interface TTSModelConfig {
  provider: TTSProvider;
  model: string;
  displayName: string;
  voices: TTSVoiceConfig[];
}

export interface TTSVoiceConfig {
  id: string;
  name: string;
  description?: string;
  provider: TTSProvider;
}

// Predefined TTS models with their voices
export const TTS_MODELS: TTSModelConfig[] = [
  // ElevenLabs models
  {
    provider: "elevenlabs",
    model: "eleven_flash_v2_5",
    displayName: "ElevenLabs Flash v2.5 (Latest, Fastest)",
    voices: [
      {
        id: "21m00Tcm4TlvDq8ikWAM",
        name: "Rachel",
        description: "Young female, American, calm",
        provider: "elevenlabs",
      },
      {
        id: "AZnzlk1XvdvUeBnXmlld",
        name: "Drew",
        description: "Middle-aged male, American",
        provider: "elevenlabs",
      },
      {
        id: "ErXwobaYiN019PkySvjV",
        name: "Antoni",
        description: "Young male, American, narrator",
        provider: "elevenlabs",
      },
      {
        id: "GBv7mTt0atIp3Br8iCZE",
        name: "Thomas",
        description: "Young male, American, calm",
        provider: "elevenlabs",
      },
      {
        id: "pNInz6obpgDQGcFmaJgB",
        name: "Bill",
        description: "Older male, American, trustworthy",
        provider: "elevenlabs",
      },
    ],
  },
  {
    provider: "elevenlabs",
    model: "eleven_multilingual_v2",
    displayName: "ElevenLabs Multilingual v2 (Best Quality)",
    voices: [
      {
        id: "21m00Tcm4TlvDq8ikWAM",
        name: "Rachel",
        description: "Young female, American, calm",
        provider: "elevenlabs",
      },
      {
        id: "AZnzlk1XvdvUeBnXmlld",
        name: "Drew",
        description: "Middle-aged male, American",
        provider: "elevenlabs",
      },
      {
        id: "EXAVITQu4vr4xnSDxMaL",
        name: "Sarah",
        description: "Young female, American, soft",
        provider: "elevenlabs",
      },
      {
        id: "onwK4e9ZLuTAKqWW03F9",
        name: "Daniel",
        description: "Middle-aged male, British, authoritative",
        provider: "elevenlabs",
      },
    ],
  },
  {
    provider: "elevenlabs",
    model: "eleven_turbo_v2_5",
    displayName: "ElevenLabs Turbo v2.5 (Fast & Quality)",
    voices: [
      {
        id: "21m00Tcm4TlvDq8ikWAM",
        name: "Rachel",
        description: "Young female, American, calm",
        provider: "elevenlabs",
      },
      {
        id: "AZnzlk1XvdvUeBnXmlld",
        name: "Drew",
        description: "Middle-aged male, American",
        provider: "elevenlabs",
      },
    ],
  },
  // OpenAI models
  {
    provider: "openai",
    model: "tts-1-hd",
    displayName: "OpenAI TTS HD (High Quality)",
    voices: [
      { id: "alloy", name: "Alloy", provider: "openai" },
      { id: "echo", name: "Echo", provider: "openai" },
      { id: "fable", name: "Fable", provider: "openai" },
      { id: "onyx", name: "Onyx", provider: "openai" },
      { id: "nova", name: "Nova", provider: "openai" },
      { id: "shimmer", name: "Shimmer", provider: "openai" },
    ],
  },
  {
    provider: "openai",
    model: "tts-1",
    displayName: "OpenAI TTS Standard",
    voices: [
      { id: "alloy", name: "Alloy", provider: "openai" },
      { id: "echo", name: "Echo", provider: "openai" },
      { id: "fable", name: "Fable", provider: "openai" },
      { id: "onyx", name: "Onyx", provider: "openai" },
      { id: "nova", name: "Nova", provider: "openai" },
      { id: "shimmer", name: "Shimmer", provider: "openai" },
    ],
  },
  // Cartesia Sonic 2
  {
    provider: "cartesia",
    model: "sonic-2",
    displayName: "Cartesia Sonic 2 (Latest)",
    voices: [
      {
        id: "default",
        name: "Default Voice",
        description: "Natural speech",
        provider: "cartesia",
      },
    ],
  },
  // Deepgram
  {
    provider: "deepgram",
    model: "aura",
    displayName: "Deepgram Aura",
    voices: [
      {
        id: "default",
        name: "Default Voice",
        description: "Natural speech",
        provider: "deepgram",
      },
    ],
  },
];

export function getDefaultTTSModel(): TTSModelConfig {
  return TTS_MODELS[0]; // ElevenLabs Flash v2.5
}

export function getDefaultVoiceForModel(model: TTSModelConfig): TTSVoiceConfig {
  return model.voices[0];
}
