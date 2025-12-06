import { NewEmailSubscriptionInput } from "app-types/email-assistant";

export function detectNewsletterSenders(
  userId: string,
  senders: {
    email: string;
    name?: string | null;
    unsubscribeLink?: string | null;
  }[],
): NewEmailSubscriptionInput[] {
  return senders.map((sender) => ({
    userId,
    senderEmail: sender.email,
    senderName: sender.name ?? null,
    unsubscribeLink: sender.unsubscribeLink ?? null,
    status: "active",
    userPreference: "keep",
  }));
}
