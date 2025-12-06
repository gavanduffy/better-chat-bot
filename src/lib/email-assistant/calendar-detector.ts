import { NewEmailCalendarEventInput } from "app-types/email-assistant";

export function parseCalendarMentions(
  userId: string,
  messageId: string,
  summary: string,
  eventStart?: Date | null,
  eventEnd?: Date | null,
): NewEmailCalendarEventInput[] {
  if (!summary) return [];
  return [
    {
      userId,
      messageId,
      eventSummary: summary,
      eventStart: eventStart ?? null,
      eventEnd: eventEnd ?? null,
      autoCreated: false,
    },
  ];
}
