import { z } from "zod";

export const EmailTaskPriority = ["high", "medium", "low"] as const;
export type EmailTaskPriority = (typeof EmailTaskPriority)[number];

export const EmailTaskStatus = ["pending", "completed", "dismissed"] as const;
export type EmailTaskStatus = (typeof EmailTaskStatus)[number];

export type EmailScan = {
  id: string;
  userId: string;
  scanTime: Date;
  emailsProcessed: number;
  importantCount: number;
  tasksFound: number;
  eventsCreated: number;
  newslettersDetected: number;
};

export type EmailTask = {
  id: string;
  userId: string;
  messageId: string;
  threadId?: string | null;
  taskDescription: string;
  dueDate?: Date | null;
  priority: EmailTaskPriority;
  status: EmailTaskStatus;
  createdAt: Date;
};

export type EmailCalendarEvent = {
  id: string;
  userId: string;
  messageId: string;
  calendarEventId?: string | null;
  eventSummary: string;
  eventStart?: Date | null;
  eventEnd?: Date | null;
  autoCreated: boolean;
  createdAt: Date;
};

export const EmailSubscriptionFrequency = [
  "daily",
  "weekly",
  "monthly",
  "irregular",
] as const;
export type EmailSubscriptionFrequency =
  (typeof EmailSubscriptionFrequency)[number];

export const EmailSubscriptionStatus = [
  "active",
  "unsubscribed",
  "blocked",
] as const;
export type EmailSubscriptionStatus = (typeof EmailSubscriptionStatus)[number];

export const EmailSubscriptionPreference = [
  "keep",
  "unsubscribe",
  "review",
] as const;
export type EmailSubscriptionPreference =
  (typeof EmailSubscriptionPreference)[number];

export type EmailSubscription = {
  id: string;
  userId: string;
  senderEmail: string;
  senderName?: string | null;
  frequency?: EmailSubscriptionFrequency | null;
  lastReceived?: Date | null;
  unsubscribeLink?: string | null;
  status: EmailSubscriptionStatus;
  userPreference: EmailSubscriptionPreference;
  createdAt: Date;
};

export const EmailPreferenceType = [
  "vip_sender",
  "important_keyword",
  "blocked_sender",
] as const;
export type EmailPreferenceType = (typeof EmailPreferenceType)[number];

export type EmailPreference = {
  id: string;
  userId: string;
  preferenceType: EmailPreferenceType;
  value: string;
  createdAt: Date;
};

export type EmailDigest = {
  scan?: EmailScan | null;
  tasks: EmailTask[];
  events: EmailCalendarEvent[];
  subscriptions: EmailSubscription[];
};

export const UpdateEmailTaskStatusSchema = z.object({
  status: z.enum(EmailTaskStatus),
});

export const UpdateEmailSettingsSchema = z.object({
  preferences: z
    .array(
      z.object({
        preferenceType: z.enum(EmailPreferenceType),
        value: z.string(),
      }),
    )
    .default([]),
});

export type NewEmailTaskInput = {
  userId: string;
  messageId: string;
  threadId?: string | null;
  taskDescription: string;
  dueDate?: Date | null;
  priority?: EmailTaskPriority;
  status?: EmailTaskStatus;
};

export type NewEmailSubscriptionInput = {
  userId: string;
  senderEmail: string;
  senderName?: string | null;
  frequency?: EmailSubscriptionFrequency | null;
  lastReceived?: Date | null;
  unsubscribeLink?: string | null;
  status?: EmailSubscriptionStatus;
  userPreference?: EmailSubscriptionPreference;
};

export type NewEmailCalendarEventInput = {
  userId: string;
  messageId: string;
  calendarEventId?: string | null;
  eventSummary: string;
  eventStart?: Date | null;
  eventEnd?: Date | null;
  autoCreated?: boolean;
};

export type EmailAssistantRepository = {
  recordScan(
    userId: string,
    counts?: Partial<
      Pick<
        EmailScan,
        | "emailsProcessed"
        | "importantCount"
        | "tasksFound"
        | "eventsCreated"
        | "newslettersDetected"
      >
    >,
  ): Promise<EmailScan>;

  listRecentScans(userId: string, limit?: number): Promise<EmailScan[]>;

  upsertTasks(tasks: NewEmailTaskInput[]): Promise<EmailTask[]>;
  listTasks(userId: string, statuses?: EmailTaskStatus[]): Promise<EmailTask[]>;
  updateTaskStatus(
    id: string,
    userId: string,
    status: EmailTaskStatus,
  ): Promise<EmailTask | null>;

  saveCalendarEvents(
    events: NewEmailCalendarEventInput[],
  ): Promise<EmailCalendarEvent[]>;
  listCalendarEvents(userId: string): Promise<EmailCalendarEvent[]>;

  upsertSubscriptions(
    subscriptions: NewEmailSubscriptionInput[],
  ): Promise<EmailSubscription[]>;
  listSubscriptions(userId: string): Promise<EmailSubscription[]>;
  updateSubscriptionPreference(
    userId: string,
    senderEmail: string,
    preference: EmailSubscriptionPreference,
    status?: EmailSubscriptionStatus,
  ): Promise<EmailSubscription | null>;

  listPreferences(userId: string): Promise<EmailPreference[]>;
  replacePreferences(
    userId: string,
    preferences: Omit<EmailPreference, "id" | "createdAt" | "userId">[],
  ): Promise<EmailPreference[]>;

  latestDigest(userId: string): Promise<EmailDigest | null>;
};
