import type { TTSRequest, TTSResponse, TTSVoice, TTSModel } from "@/types/tts";

const APIPIE_BASE_URL = "https://apipie.ai/v1";

export class TTSClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    const response = await fetch(`${APIPIE_BASE_URL}/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioDetailsHeader = response.headers.get("X-Audio-Details");
    let details;

    if (audioDetailsHeader) {
      try {
        details = JSON.parse(audioDetailsHeader);
      } catch (e) {
        console.warn("Failed to parse X-Audio-Details header", e);
      }
    }

    return {
      audio: audioBlob,
      details,
    };
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    const response = await fetch(`${APIPIE_BASE_URL}/models?voices`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  async getAvailableTTSModels(): Promise<TTSModel[]> {
    const response = await fetch(`${APIPIE_BASE_URL}/models?type=voice`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TTS models: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }
}

export function createTTSClient(apiKey: string): TTSClient {
  return new TTSClient(apiKey);
}
