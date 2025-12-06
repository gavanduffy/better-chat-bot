import { NextResponse } from "next/server";
import { z } from "zod";

import { emailAssistantRepository } from "lib/db/repository";
import { getSession } from "auth/server";

const bodySchema = z.object({
  messageId: z.string(),
  calendarEventId: z.string().optional(),
  eventSummary: z.string(),
  eventStart: z.string().datetime().optional(),
  eventEnd: z.string().datetime().optional(),
  autoCreated: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = (await request.json().catch(() => ({}))) as unknown;
  const payload = bodySchema.parse(json ?? {});

  const [event] = await emailAssistantRepository.saveCalendarEvents([
    {
      ...payload,
      userId: session.user.id,
      eventStart: payload.eventStart ? new Date(payload.eventStart) : undefined,
      eventEnd: payload.eventEnd ? new Date(payload.eventEnd) : undefined,
    },
  ]);

  return NextResponse.json({ event });
}
