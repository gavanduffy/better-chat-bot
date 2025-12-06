import { NextResponse } from "next/server";

import { UpdateEmailTaskStatusSchema } from "app-types/email-assistant";
import { emailAssistantRepository } from "lib/db/repository";
import { getSession } from "auth/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = (await request.json().catch(() => ({}))) as unknown;
  const { status } = UpdateEmailTaskStatusSchema.parse(json ?? {});

  const updated = await emailAssistantRepository.updateTaskStatus(
    params.id,
    session.user.id,
    status,
  );

  if (!updated) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task: updated });
}
