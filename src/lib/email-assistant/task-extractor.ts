import {
  EmailTask,
  EmailTaskPriority,
  NewEmailTaskInput,
} from "app-types/email-assistant";

export function prioritizeTask(text: string): EmailTaskPriority {
  const normalized = text.toLowerCase();
  if (normalized.includes("urgent") || normalized.includes("asap")) {
    return "high";
  }
  if (normalized.includes("follow up") || normalized.includes("reminder")) {
    return "medium";
  }
  return "low";
}

export function mapTasksToEntities(
  tasks: NewEmailTaskInput[],
  now = new Date(),
) {
  return tasks.map<EmailTask>((task) => ({
    id: "", // populated by database
    userId: task.userId,
    messageId: task.messageId,
    threadId: task.threadId ?? null,
    taskDescription: task.taskDescription,
    dueDate: task.dueDate ?? null,
    priority: task.priority ?? prioritizeTask(task.taskDescription),
    status: task.status ?? "pending",
    createdAt: now,
  }));
}
