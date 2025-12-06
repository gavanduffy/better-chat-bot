import { NextResponse } from "next/server";
import { z } from "zod";

import {
  EmailSubscriptionFrequency,
  EmailSubscriptionPreference,
  EmailSubscriptionStatus,
  EmailTaskPriority,
  EmailTaskStatus,
} from "app-types/email-assistant";
import { performEmailScan } from "lib/email-assistant/analyzer";
import { getSession } from "auth/server";

const taskSchema = z.object({
  messageId: z.string(),
  threadId: z.string().optional(),
  taskDescription: z.string(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(EmailTaskPriority).optional(),
  status: z.enum(EmailTaskStatus).optional(),
});

const eventSchema = z.object({
  messageId: z.string(),
  calendarEventId: z.string().optional(),
  eventSummary: z.string(),
  eventStart: z.string().datetime().optional(),
  eventEnd: z.string().datetime().optional(),
  autoCreated: z.boolean().optional(),
});

const subscriptionSchema = z.object({
  senderEmail: z.string(),
  senderName: z.string().optional(),
  frequency: z.enum(EmailSubscriptionFrequency).optional(),
  lastReceived: z.string().datetime().optional(),
  unsubscribeLink: z.string().optional(),
  status: z.enum(EmailSubscriptionStatus).optional(),
  userPreference: z.enum(EmailSubscriptionPreference).optional(),
});

const scanRequestSchema = z.object({
  tasks: z.array(taskSchema).optional(),
  events: z.array(eventSchema).optional(),
  subscriptions: z.array(subscriptionSchema).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = (await request.json().catch(() => ({}))) as unknown;
  const {
    tasks = [],
    events = [],
    subscriptions = [],
  } = scanRequestSchema.parse(json ?? {});

  const digest = await performEmailScan(session.user.id, {
    tasks: tasks.map((task) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      userId: session.user.id,
    })),
    events: events.map((event) => ({
      ...event,
      eventStart: event.eventStart ? new Date(event.eventStart) : undefined,
      eventEnd: event.eventEnd ? new Date(event.eventEnd) : undefined,
      userId: session.user.id,
    })),
    subscriptions: subscriptions.map((subscription) => ({
      ...subscription,
      lastReceived: subscription.lastReceived
        ? new Date(subscription.lastReceived)
        : undefined,
      userId: session.user.id,
    })),
  });

  return NextResponse.json({ digest });
}
