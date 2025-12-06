import { NextResponse } from "next/server";

import { UpdateEmailSettingsSchema } from "app-types/email-assistant";
import { emailAssistantRepository } from "lib/db/repository";
import { getSession } from "auth/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await emailAssistantRepository.listPreferences(
    session.user.id,
  );
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = (await request.json().catch(() => ({}))) as unknown;
  const { preferences } = UpdateEmailSettingsSchema.parse(json ?? {});

  const updated = await emailAssistantRepository.replacePreferences(
    session.user.id,
    preferences,
  );

  return NextResponse.json({ preferences: updated });
}
