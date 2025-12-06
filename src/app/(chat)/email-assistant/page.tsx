import { notFound } from "next/navigation";

import CalendarEventPreview from "@/components/email-assistant/CalendarEventPreview";
import EmailAssistantSettings from "@/components/email-assistant/EmailAssistantSettings";
import EmailDigest from "@/components/email-assistant/EmailDigest";
import SubscriptionManager from "@/components/email-assistant/SubscriptionManager";
import TaskList from "@/components/email-assistant/TaskList";
import { getSession } from "auth/server";
import { latestEmailDigest } from "lib/email-assistant/analyzer";
import { emailAssistantRepository } from "lib/db/repository";

export const dynamic = "force-dynamic";

export default async function EmailAssistantPage() {
  const session = await getSession();
  if (!session?.user.id) {
    notFound();
  }

  const digest = await latestEmailDigest(session.user.id);
  const preferences = await emailAssistantRepository.listPreferences(
    session.user.id,
  );

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Email Assistant</h1>
        <p className="text-muted-foreground">
          Review digests, action items, calendar suggestions, and newsletter
          preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EmailDigest digest={digest} />
        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tasks</h3>
              <span className="text-xs text-muted-foreground">
                {digest?.tasks.length ?? 0} open
              </span>
            </div>
            <TaskList tasks={digest?.tasks ?? []} />
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-4">
            <h3 className="mb-2 text-lg font-semibold">Calendar previews</h3>
            <CalendarEventPreview events={digest?.events ?? []} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <h3 className="mb-2 text-lg font-semibold">Newsletter manager</h3>
          <SubscriptionManager subscriptions={digest?.subscriptions ?? []} />
        </div>
        <EmailAssistantSettings preferences={preferences} />
      </div>
    </div>
  );
}
