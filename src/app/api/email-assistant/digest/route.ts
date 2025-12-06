import { NextResponse } from "next/server";

import { latestEmailDigest } from "lib/email-assistant/analyzer";
import { getSession } from "auth/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const digest = await latestEmailDigest(session.user.id);

  return NextResponse.json({ digest });
}
