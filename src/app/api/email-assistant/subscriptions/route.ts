import { NextResponse } from "next/server";

import { emailAssistantRepository } from "lib/db/repository";
import { getSession } from "auth/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await emailAssistantRepository.listSubscriptions(
    session.user.id,
  );
  return NextResponse.json({ subscriptions });
}
