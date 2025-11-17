export type TTSProvider = "openai" | "elevenlabs" | "cartesia" | "deepgram";

export interface TTSVoice {
  provider: TTSProvider;
  model: string;
  voice_id: string;
  name: string;
  description?: string;
}

export interface TTSModel {
  provider: TTSProvider;
  model: string;
  description?: string;
  max_tokens?: number;
}

export interface TTSRequest {
  provider: TTSProvider;
  model: string;
  input: string;
  voice: string;
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  responseFormat?: string;
  speed?: number;
  stream?: boolean;
}

export interface TTSResponse {
  audio: Blob;
  details?: {
    provider: string;
    model: string;
    voice: string;
    promptChar: number;
    cost: number;
    latencyMs: number;
  };
}
