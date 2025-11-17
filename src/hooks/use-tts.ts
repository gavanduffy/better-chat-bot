import { useState, useCallback, useRef, useEffect } from "react";
import type { TTSRequest, TTSProvider } from "@/types/tts";

interface UseTTSOptions {
  apiKey: string;
  provider?: TTSProvider;
  model?: string;
  voice?: string;
  speed?: number;
}

interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

export function useTTS(options: UseTTSOptions) {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    progress: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const speak = useCallback(
    async (text: string, overrides?: Partial<TTSRequest>) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        cleanup();

        const request: TTSRequest = {
          provider: options.provider || "openai",
          model: options.model || "tts-1-hd",
          input: text,
          voice: options.voice || "alloy",
          speed: options.speed || 1,
          responseFormat: "mp3",
          stream: false,
          ...overrides,
        };

        const response = await fetch("/api/tts/synthesize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to synthesize speech: ${response.statusText}`,
          );
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.addEventListener("play", () => {
          setState((prev) => ({ ...prev, isPlaying: true, isLoading: false }));
        });

        audio.addEventListener("pause", () => {
          setState((prev) => ({ ...prev, isPlaying: false }));
        });

        audio.addEventListener("ended", () => {
          setState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
          cleanup();
        });

        audio.addEventListener("timeupdate", () => {
          if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            setState((prev) => ({ ...prev, progress }));
          }
        });

        audio.addEventListener("error", () => {
          setState((prev) => ({
            ...prev,
            error: "Failed to play audio",
            isPlaying: false,
            isLoading: false,
          }));
          cleanup();
        });

        await audio.play();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false,
          isPlaying: false,
        }));
      }
    },
    [options, cleanup],
  );

  const stop = useCallback(() => {
    cleanup();
    setState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
  }, [cleanup]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    ...state,
  };
}
