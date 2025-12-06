import { EmailCalendarEvent } from "app-types/email-assistant";

export type CalendarEventPreviewProps = {
  events: EmailCalendarEvent[];
};

export function CalendarEventPreview({ events }: CalendarEventPreviewProps) {
  if (!events.length) {
    return (
      <p className="text-muted-foreground">No calendar events detected.</p>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-md border border-border/60 bg-card p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium leading-tight">{event.eventSummary}</p>
              {event.messageId && (
                <p className="text-xs text-muted-foreground">
                  Message ID: {event.messageId}
                </p>
              )}
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {event.eventStart
                ? new Date(event.eventStart).toLocaleString()
                : "Start TBD"}
              {event.eventEnd && (
                <div>Ends {new Date(event.eventEnd).toLocaleString()}</div>
              )}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {event.autoCreated ? "Auto created" : "Awaiting confirmation"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default CalendarEventPreview;
