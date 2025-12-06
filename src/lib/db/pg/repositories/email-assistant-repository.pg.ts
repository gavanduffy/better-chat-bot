import {
  EmailAssistantRepository,
  EmailDigest,
  EmailPreference,
  EmailSubscriptionPreference,
  EmailSubscriptionStatus,
  EmailTaskStatus,
  NewEmailCalendarEventInput,
  NewEmailSubscriptionInput,
  NewEmailTaskInput,
} from "app-types/email-assistant";
import { pgDb as db } from "../db.pg";
import {
  EmailCalendarEventTable,
  EmailPreferenceTable,
  EmailScanTable,
  EmailSubscriptionTable,
  EmailTaskTable,
} from "../schema.pg";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

export const pgEmailAssistantRepository: EmailAssistantRepository = {
  async recordScan(userId, counts = {}) {
    const [scan] = await db
      .insert(EmailScanTable)
      .values({
        userId,
        scanTime: new Date(),
        emailsProcessed: counts.emailsProcessed ?? 0,
        importantCount: counts.importantCount ?? 0,
        tasksFound: counts.tasksFound ?? 0,
        eventsCreated: counts.eventsCreated ?? 0,
        newslettersDetected: counts.newslettersDetected ?? 0,
      })
      .returning();

    return scan;
  },

  async listRecentScans(userId, limit = 10) {
    const scans = await db
      .select()
      .from(EmailScanTable)
      .where(eq(EmailScanTable.userId, userId))
      .orderBy(desc(EmailScanTable.scanTime))
      .limit(limit);

    return scans;
  },

  async upsertTasks(tasks) {
    if (!tasks.length) return [];

    const rows = tasks.map((task) => ({
      userId: task.userId,
      messageId: task.messageId,
      threadId: task.threadId ?? null,
      taskDescription: task.taskDescription,
      dueDate: task.dueDate ?? null,
      priority: task.priority ?? "medium",
      status: task.status ?? "pending",
    }));

    const inserted = await db
      .insert(EmailTaskTable)
      .values(rows)
      .onConflictDoUpdate({
        target: [
          EmailTaskTable.userId,
          EmailTaskTable.messageId,
          EmailTaskTable.taskDescription,
        ],
        set: {
          dueDate: sql`excluded.due_date`,
          priority: sql`excluded.priority`,
          status: sql`excluded.status`,
          threadId: sql`excluded.thread_id`,
        },
      })
      .returning();

    return inserted;
  },

  async listTasks(userId, statuses) {
    const whereClause = statuses?.length
      ? and(
          eq(EmailTaskTable.userId, userId),
          inArray(EmailTaskTable.status, statuses),
        )
      : eq(EmailTaskTable.userId, userId);

    const tasks = await db
      .select()
      .from(EmailTaskTable)
      .where(whereClause)
      .orderBy(desc(EmailTaskTable.createdAt));

    return tasks;
  },

  async updateTaskStatus(id, userId, status) {
    const [task] = await db
      .update(EmailTaskTable)
      .set({ status })
      .where(and(eq(EmailTaskTable.id, id), eq(EmailTaskTable.userId, userId)))
      .returning();

    return task ?? null;
  },

  async saveCalendarEvents(events) {
    if (!events.length) return [];

    const rows = events.map((event) => ({
      userId: event.userId,
      messageId: event.messageId,
      calendarEventId: event.calendarEventId ?? null,
      eventSummary: event.eventSummary,
      eventStart: event.eventStart ?? null,
      eventEnd: event.eventEnd ?? null,
      autoCreated: event.autoCreated ?? false,
    }));

    const saved = await db
      .insert(EmailCalendarEventTable)
      .values(rows)
      .onConflictDoNothing({
        target: [
          EmailCalendarEventTable.userId,
          EmailCalendarEventTable.messageId,
          EmailCalendarEventTable.eventSummary,
        ],
      })
      .returning();

    return saved;
  },

  async listCalendarEvents(userId) {
    const events = await db
      .select()
      .from(EmailCalendarEventTable)
      .where(eq(EmailCalendarEventTable.userId, userId))
      .orderBy(desc(EmailCalendarEventTable.createdAt));

    return events;
  },

  async upsertSubscriptions(subscriptions) {
    if (!subscriptions.length) return [];

    const rows = subscriptions.map((subscription) => ({
      userId: subscription.userId,
      senderEmail: subscription.senderEmail,
      senderName: subscription.senderName ?? null,
      frequency: subscription.frequency ?? null,
      lastReceived: subscription.lastReceived ?? null,
      unsubscribeLink: subscription.unsubscribeLink ?? null,
      status: subscription.status ?? "active",
      userPreference: subscription.userPreference ?? "keep",
    }));

    const saved = await db
      .insert(EmailSubscriptionTable)
      .values(rows)
      .onConflictDoUpdate({
        target: [
          EmailSubscriptionTable.userId,
          EmailSubscriptionTable.senderEmail,
        ],
        set: {
          senderName: sql`excluded.sender_name`,
          frequency: sql`excluded.frequency`,
          lastReceived: sql`excluded.last_received`,
          unsubscribeLink: sql`excluded.unsubscribe_link`,
          status: sql`excluded.status`,
          userPreference: sql`excluded.user_preference`,
        },
      })
      .returning();

    return saved;
  },

  async listSubscriptions(userId) {
    const subscriptions = await db
      .select()
      .from(EmailSubscriptionTable)
      .where(eq(EmailSubscriptionTable.userId, userId))
      .orderBy(desc(EmailSubscriptionTable.createdAt));

    return subscriptions;
  },

  async updateSubscriptionPreference(userId, senderEmail, preference, status) {
    const [subscription] = await db
      .update(EmailSubscriptionTable)
      .set({
        userPreference: preference,
        ...(status ? { status } : {}),
      })
      .where(
        and(
          eq(EmailSubscriptionTable.userId, userId),
          eq(EmailSubscriptionTable.senderEmail, senderEmail),
        ),
      )
      .returning();

    return subscription ?? null;
  },

  async listPreferences(userId) {
    const preferences = await db
      .select()
      .from(EmailPreferenceTable)
      .where(eq(EmailPreferenceTable.userId, userId))
      .orderBy(desc(EmailPreferenceTable.createdAt));

    return preferences as EmailPreference[];
  },

  async replacePreferences(userId, preferences) {
    await db
      .delete(EmailPreferenceTable)
      .where(eq(EmailPreferenceTable.userId, userId));

    if (!preferences.length) {
      return [];
    }

    const rows = preferences.map((preference) => ({
      userId,
      preferenceType: preference.preferenceType,
      value: preference.value,
    }));

    const inserted = await db
      .insert(EmailPreferenceTable)
      .values(rows)
      .onConflictDoNothing()
      .returning();

    return inserted as EmailPreference[];
  },

  async latestDigest(userId) {
    const [latestScan] = await db
      .select()
      .from(EmailScanTable)
      .where(eq(EmailScanTable.userId, userId))
      .orderBy(desc(EmailScanTable.scanTime))
      .limit(1);

    const [tasks, events, subscriptions] = await Promise.all([
      pgEmailAssistantRepository.listTasks(userId, [
        "pending",
        "completed",
        "dismissed",
      ] as EmailTaskStatus[]),
      pgEmailAssistantRepository.listCalendarEvents(userId),
      pgEmailAssistantRepository.listSubscriptions(userId),
    ]);

    const digest: EmailDigest = {
      scan: latestScan ?? null,
      tasks,
      events,
      subscriptions,
    };

    return digest;
  },
};
