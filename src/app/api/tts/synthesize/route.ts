import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TTSRequestSchema = z.object({
  provider: z.enum(["openai", "elevenlabs", "cartesia", "deepgram"]),
  model: z.string(),
  input: z.string(),
  voice: z.string(),
  voiceSettings: z
    .object({
      stability: z.number().min(0).max(1).optional(),
      similarity_boost: z.number().min(0).max(1).optional(),
      style: z.number().min(0).max(1).optional(),
      use_speaker_boost: z.boolean().optional(),
    })
    .optional(),
  responseFormat: z.string().optional(),
  speed: z.number().min(0.25).max(4.0).optional(),
  stream: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ttsRequest = TTSRequestSchema.parse(body);

    // Get API key from environment variable
    const apiKey = process.env.APIPIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "APIPIE_API_KEY not configured" },
        { status: 500 },
      );
    }

    // Call APIpie.ai TTS endpoint
    const response = await fetch("https://apipie.ai/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(ttsRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("APIpie TTS error:", errorText);
      return NextResponse.json(
        { error: `TTS API error: ${response.statusText}` },
        { status: response.status },
      );
    }

    // Get audio blob
    const audioBlob = await response.blob();

    // Forward the X-Audio-Details header if present
    const audioDetails = response.headers.get("X-Audio-Details");

    const headers: Record<string, string> = {
      "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
    };

    if (audioDetails) {
      headers["X-Audio-Details"] = audioDetails;
    }

    return new NextResponse(audioBlob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("TTS synthesis error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
