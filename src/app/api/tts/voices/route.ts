import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const apiKey = process.env.APIPIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "APIPIE_API_KEY not configured" },
        { status: 500 },
      );
    }

    const response = await fetch("https://apipie.ai/v1/models?voices", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("APIpie voices error:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch voices: ${response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Voices fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
