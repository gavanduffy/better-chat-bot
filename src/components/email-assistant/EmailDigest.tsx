import {
  EmailDigest as EmailDigestType,
  EmailTask,
} from "app-types/email-assistant";

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/40 p-3 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function TaskList({ tasks }: { tasks: EmailTask[] }) {
  if (!tasks.length) {
    return <p className="text-muted-foreground">No tasks detected yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="rounded-md border border-border/50 bg-background/70 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{task.taskDescription}</p>
              <p className="text-xs text-muted-foreground">
                Priority: {task.priority} • Status: {task.status}
              </p>
            </div>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground">
                Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function EmailDigest({
  digest,
}: {
  digest?: EmailDigestType | null;
}) {
  const scan = digest?.scan;
  const counts = {
    processed: scan?.emailsProcessed ?? 0,
    important: scan?.importantCount ?? 0,
    tasks: scan?.tasksFound ?? 0,
    events: scan?.eventsCreated ?? 0,
    newsletters: scan?.newslettersDetected ?? 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Email Digest</h2>
          <p className="text-sm text-muted-foreground">
            {scan?.scanTime
              ? `Last scanned ${new Date(scan.scanTime).toLocaleString()}`
              : "Scan has not run yet."}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Counter label="Emails processed" value={counts.processed} />
        <Counter label="Important" value={counts.important} />
        <Counter label="Tasks" value={counts.tasks} />
        <Counter label="Events" value={counts.events} />
        <Counter label="Newsletters" value={counts.newsletters} />
      </div>

      <div className="space-y-2 rounded-lg border border-border/60 bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Action items</h3>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {digest?.tasks.length ?? 0} items
          </span>
        </div>
        <TaskList tasks={digest?.tasks ?? []} />
      </div>
    </div>
  );
}

export default EmailDigest;
