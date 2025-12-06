import { EmailPreference } from "app-types/email-assistant";

export type EmailAssistantSettingsProps = {
  preferences: EmailPreference[];
  onPreferenceChange?: (updated: EmailPreference[]) => void;
};

export function EmailAssistantSettings({
  preferences,
  onPreferenceChange,
}: EmailAssistantSettingsProps) {
  const handleRemove = (id: string) => {
    onPreferenceChange?.(
      preferences.filter((preference) => preference.id !== id),
    );
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Preferences</h3>
        <p className="text-xs text-muted-foreground">
          Configure VIP senders, keywords, and blocked addresses.
        </p>
      </div>

      {preferences.length === 0 ? (
        <p className="text-muted-foreground">No preferences configured.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {preferences.map((preference) => (
            <li
              key={preference.id}
              className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2"
            >
              <div>
                <p className="font-medium">{preference.value}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {preference.preferenceType}
                </p>
              </div>
              {onPreferenceChange && (
                <button
                  className="text-xs text-destructive"
                  onClick={() => handleRemove(preference.id)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EmailAssistantSettings;
