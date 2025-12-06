import { NextResponse } from "next/server";
import { z } from "zod";

import { emailAssistantRepository } from "lib/db/repository";
import { getSession } from "auth/server";

const bodySchema = z.object({
  senderEmail: z.string(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = (await request.json().catch(() => ({}))) as unknown;
  const { senderEmail } = bodySchema.parse(json ?? {});

  const subscription =
    await emailAssistantRepository.updateSubscriptionPreference(
      session.user.id,
      senderEmail,
      "unsubscribe",
      "unsubscribed",
    );

  if (!subscription) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ subscription });
}
