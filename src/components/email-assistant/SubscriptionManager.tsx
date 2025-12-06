import {
  EmailSubscription,
  EmailSubscriptionPreference,
} from "app-types/email-assistant";

export type SubscriptionManagerProps = {
  subscriptions: EmailSubscription[];
  onPreferenceChange?: (
    senderEmail: string,
    preference: EmailSubscriptionPreference,
  ) => void;
};

export function SubscriptionManager({
  subscriptions,
  onPreferenceChange,
}: SubscriptionManagerProps) {
  if (!subscriptions.length) {
    return <p className="text-muted-foreground">No newsletters detected.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Sender</th>
            <th className="px-3 py-2">Frequency</th>
            <th className="px-3 py-2">Last email</th>
            <th className="px-3 py-2">Preference</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr key={subscription.id} className="border-t border-border/50">
              <td className="px-3 py-2">
                <div className="font-medium">{subscription.senderEmail}</div>
                {subscription.senderName && (
                  <div className="text-xs text-muted-foreground">
                    {subscription.senderName}
                  </div>
                )}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {subscription.frequency ?? "unknown"}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {subscription.lastReceived
                  ? new Date(subscription.lastReceived).toLocaleDateString()
                  : "n/a"}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-2 text-xs">
                  {(["keep", "unsubscribe", "review"] as const).map(
                    (preference) => (
                      <button
                        key={preference}
                        className={`rounded border px-2 py-1 ${
                          subscription.userPreference === preference
                            ? "border-primary text-primary"
                            : "border-border text-foreground"
                        }`}
                        onClick={() =>
                          onPreferenceChange?.(
                            subscription.senderEmail,
                            preference,
                          )
                        }
                      >
                        {preference}
                      </button>
                    ),
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubscriptionManager;
