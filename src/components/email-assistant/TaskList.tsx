import { EmailTask, EmailTaskStatus } from "app-types/email-assistant";

export type TaskListProps = {
  tasks: EmailTask[];
  onStatusChange?: (taskId: string, status: EmailTaskStatus) => void;
};

export function TaskList({ tasks, onStatusChange }: TaskListProps) {
  if (!tasks.length) {
    return <p className="text-muted-foreground">No tasks available.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-start justify-between rounded-md border border-border/60 bg-card px-3 py-2"
        >
          <div className="space-y-1">
            <p className="font-medium leading-tight">{task.taskDescription}</p>
            <p className="text-xs text-muted-foreground">
              Priority: {task.priority} • Status: {task.status}
            </p>
            {task.dueDate && (
              <p className="text-xs text-muted-foreground">
                Due {new Date(task.dueDate).toLocaleString()}
              </p>
            )}
          </div>
          {onStatusChange && (
            <div className="flex items-center gap-1 text-xs">
              {(
                [
                  "pending",
                  "completed",
                  "dismissed",
                ] satisfies EmailTaskStatus[]
              ).map((status) => (
                <button
                  key={status}
                  className={`rounded border px-2 py-1 ${
                    task.status === status
                      ? "border-primary text-primary"
                      : "border-border text-foreground"
                  }`}
                  onClick={() => onStatusChange(task.id, status)}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TaskList;
