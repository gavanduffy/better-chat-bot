import { describe, it, expect } from "vitest";
import {
  TTS_MODELS,
  getDefaultTTSModel,
  getDefaultVoiceForModel,
} from "./tts-config";

describe("TTS Configuration", () => {
  it("should have at least one TTS model defined", () => {
    expect(TTS_MODELS.length).toBeGreaterThan(0);
  });

  it("should have ElevenLabs Flash v2.5 as first model", () => {
    const firstModel = TTS_MODELS[0];
    expect(firstModel.provider).toBe("elevenlabs");
    expect(firstModel.model).toBe("eleven_flash_v2_5");
  });

  it("should include all requested providers", () => {
    const providers = TTS_MODELS.map((m) => m.provider);
    expect(providers).toContain("elevenlabs");
    expect(providers).toContain("openai");
    expect(providers).toContain("cartesia");
    expect(providers).toContain("deepgram");
  });

  it("should have voices for each model", () => {
    TTS_MODELS.forEach((model) => {
      expect(model.voices.length).toBeGreaterThan(0);
    });
  });

  it("should return default model", () => {
    const defaultModel = getDefaultTTSModel();
    expect(defaultModel).toBeDefined();
    expect(defaultModel.provider).toBe("elevenlabs");
    expect(defaultModel.model).toBe("eleven_flash_v2_5");
  });

  it("should return default voice for model", () => {
    const model = getDefaultTTSModel();
    const defaultVoice = getDefaultVoiceForModel(model);
    expect(defaultVoice).toBeDefined();
    expect(defaultVoice.name).toBe("Rachel");
  });

  it("should have proper voice structure", () => {
    const firstModel = TTS_MODELS[0];
    const firstVoice = firstModel.voices[0];
    expect(firstVoice).toHaveProperty("id");
    expect(firstVoice).toHaveProperty("name");
    expect(firstVoice).toHaveProperty("provider");
    expect(firstVoice.provider).toBe(firstModel.provider);
  });

  it("should have OpenAI TTS HD model", () => {
    const openaiModel = TTS_MODELS.find(
      (m) => m.provider === "openai" && m.model === "tts-1-hd",
    );
    expect(openaiModel).toBeDefined();
    expect(openaiModel?.displayName).toContain("HD");
  });

  it("should have ElevenLabs Multilingual v2 model", () => {
    const elevenLabsModel = TTS_MODELS.find(
      (m) =>
        m.provider === "elevenlabs" && m.model === "eleven_multilingual_v2",
    );
    expect(elevenLabsModel).toBeDefined();
    expect(elevenLabsModel?.displayName).toContain("Multilingual");
  });

  it("should have Cartesia Sonic 2 model", () => {
    const cartesiaModel = TTS_MODELS.find(
      (m) => m.provider === "cartesia" && m.model === "sonic-2",
    );
    expect(cartesiaModel).toBeDefined();
    expect(cartesiaModel?.displayName).toContain("Sonic 2");
  });

  it("should have Deepgram Aura model", () => {
    const deepgramModel = TTS_MODELS.find(
      (m) => m.provider === "deepgram" && m.model === "aura",
    );
    expect(deepgramModel).toBeDefined();
    expect(deepgramModel?.displayName).toContain("Aura");
  });
});
