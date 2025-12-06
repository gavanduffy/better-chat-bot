import { NextResponse } from "next/server";

import { performEmailScan } from "lib/email-assistant/analyzer";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configuredUsers = process.env.EMAIL_ASSISTANT_USER_IDS?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const uniqueUsers = configuredUsers ?? [];

  const results = await Promise.all(
    uniqueUsers.map((userId) => performEmailScan(userId)),
  );

  return NextResponse.json({
    success: true,
    scannedAt: new Date(),
    userCount: uniqueUsers.length,
    scans: results.map((result) => result.scan?.id),
  });
}

export const config = {
  runtime: "edge",
};
