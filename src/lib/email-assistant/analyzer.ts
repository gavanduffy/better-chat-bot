import {
  EmailDigest,
  NewEmailCalendarEventInput,
  NewEmailSubscriptionInput,
  NewEmailTaskInput,
} from "app-types/email-assistant";
import { emailAssistantRepository } from "lib/db/repository";
export { EMAIL_ASSISTANT_SYSTEM_PROMPT } from "./prompt";

export async function performEmailScan(
  userId: string,
  options?: {
    tasks?: NewEmailTaskInput[];
    events?: NewEmailCalendarEventInput[];
    subscriptions?: NewEmailSubscriptionInput[];
  },
): Promise<EmailDigest> {
  const scan = await emailAssistantRepository.recordScan(userId, {
    tasksFound: options?.tasks?.length ?? 0,
    eventsCreated: options?.events?.length ?? 0,
    newslettersDetected: options?.subscriptions?.length ?? 0,
  });

  const [savedTasks, savedEvents, savedSubscriptions] = await Promise.all([
    options?.tasks?.length
      ? emailAssistantRepository.upsertTasks(options.tasks)
      : Promise.resolve([]),
    options?.events?.length
      ? emailAssistantRepository.saveCalendarEvents(options.events)
      : Promise.resolve([]),
    options?.subscriptions?.length
      ? emailAssistantRepository.upsertSubscriptions(options.subscriptions)
      : Promise.resolve([]),
  ]);

  return {
    scan,
    tasks: savedTasks,
    events: savedEvents,
    subscriptions: savedSubscriptions,
  };
}

export async function latestEmailDigest(userId: string) {
  return emailAssistantRepository.latestDigest(userId);
}
