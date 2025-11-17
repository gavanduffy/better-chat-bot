import useSWR from "swr";
import type { TTSVoice } from "@/types/tts";

interface VoicesResponse {
  object: string;
  data: TTSVoice[];
}

const fetcher = async (url: string): Promise<VoicesResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch voices");
  }
  return response.json();
};

export function useTTSVoices() {
  const { data, error, isLoading } = useSWR<VoicesResponse>(
    "/api/tts/voices",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    },
  );

  return {
    voices: data?.data || [],
    isLoading,
    error,
  };
}
