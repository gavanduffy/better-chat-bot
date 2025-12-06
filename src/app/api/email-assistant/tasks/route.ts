import { NextResponse } from "next/server";
import { z } from "zod";

import { EmailTaskStatus } from "app-types/email-assistant";
import { emailAssistantRepository } from "lib/db/repository";
import { getSession } from "auth/server";

const querySchema = z.object({
  status: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const params = querySchema.parse(Object.fromEntries(url.searchParams));
  const statuses = params.status
    ? params.status
        .split(",")
        .map((status) => status.trim())
        .filter((status): status is EmailTaskStatus =>
          EmailTaskStatus.includes(status as EmailTaskStatus),
        )
    : undefined;

  const tasks = await emailAssistantRepository.listTasks(
    session.user.id,
    statuses,
  );
  return NextResponse.json({ tasks });
}
