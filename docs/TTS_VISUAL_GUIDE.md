# TTS Feature Visual Guide

## UI Overview

The TTS feature integrates seamlessly into the existing message interface. Here's what users will see:

### 1. TTS Button Location

The TTS button appears at the bottom of every AI assistant message, alongside other action buttons (Copy, Refresh Model, Delete).

```
┌─────────────────────────────────────────────────┐
│ AI Assistant Message                            │
│                                                   │
│ [Message content appears here with markdown      │
│  formatting, code blocks, etc.]                  │
│                                                   │
│ ┌──────────────────────────────────────────┐    │
│ │  [🔊] [📋] [🔄] [🗑️] [⋮]               │    │
│ │   ↑    Copy  Model  Delete  More          │    │
│ │   TTS                                      │    │
│ └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 2. TTS Button States

#### Default State (Not Playing)
- Icon: 🔊 Volume2 (Speaker icon)
- Tooltip: "Speak (ElevenLabs Flash v2.5)"
- Color: Default button color
- Hover: Button highlights

#### Playing State
- Icon: 🔇 VolumeX (Muted speaker icon)
- Tooltip: "Stop"
- Color: Highlighted to indicate active playback
- Hover: Shows stop action

#### Loading State
- Icon: ⏳ Loader2 (Spinning animation)
- Tooltip: "Loading..."
- Button: Disabled during loading
- Visual: Spinning animation indicates processing

### 3. Settings Button

Next to the TTS button is a settings gear icon:

```
[🔊] [⚙️]
  ↑    ↑
 Play Settings
```

### 4. Settings Popup

Clicking the settings button opens a popup panel:

```
┌─────────────────────────────────────────┐
│ Text-to-Speech Settings                 │
│                                          │
│ Choose your preferred voice model       │
│ and voice                                │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Model                               │ │
│ │ ┌───────────────────────────────┐   │ │
│ │ │ ElevenLabs Flash v2.5 ▼       │   │ │
│ │ └───────────────────────────────┘   │ │
│ │                                     │ │
│ │ Options:                            │ │
│ │ • ElevenLabs Flash v2.5 (Latest)   │ │
│ │ • ElevenLabs Multilingual v2       │ │
│ │ • ElevenLabs Turbo v2.5            │ │
│ │ • OpenAI TTS HD                     │ │
│ │ • OpenAI TTS Standard               │ │
│ │ • Cartesia Sonic 2                  │ │
│ │ • Deepgram Aura                     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Voice                               │ │
│ │ ┌───────────────────────────────┐   │ │
│ │ │ Rachel                    ▼   │   │ │
│ │ └───────────────────────────────┘   │ │
│ │                                     │ │
│ │ Options:                            │ │
│ │ • Rachel                            │ │
│ │   Young female, American, calm      │ │
│ │ • Drew                              │ │
│ │   Middle-aged male, American        │ │
│ │ • Antoni                            │ │
│ │   Young male, American, narrator    │ │
│ │ • Thomas                            │ │
│ │   Young male, American, calm        │ │
│ │ • Bill                              │ │
│ │   Older male, American, trustworthy │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 5. Voice Selection Dropdown

When selecting a voice, each option shows:
- **Voice Name** (e.g., "Rachel")
- **Description** (e.g., "Young female, American, calm")

```
┌───────────────────────────────────┐
│ Rachel                            │
│ Young female, American, calm      │
├───────────────────────────────────┤
│ Drew                              │
│ Middle-aged male, American        │
├───────────────────────────────────┤
│ Antoni                            │
│ Young male, American, narrator    │
└───────────────────────────────────┘
```

### 6. Error State

If an error occurs, it's displayed in the settings popup:

```
┌─────────────────────────────────────────┐
│ Text-to-Speech Settings                 │
│                                          │
│ [Model and Voice selectors]             │
│                                          │
│ ⚠️ Error: APIPIE_API_KEY not configured │
└─────────────────────────────────────────┘
```

## User Flow

### Basic Usage Flow

1. **User reads AI response** → sees TTS button
2. **Clicks speaker icon** → audio starts playing
3. **Button changes to mute icon** → indicates active playback
4. **Audio plays** → user hears the message
5. **Clicks mute icon or audio ends** → playback stops

### Settings Configuration Flow

1. **Clicks settings icon** → popup opens
2. **Selects model** → dropdown shows all providers
3. **Selects voice** → dropdown shows voices for selected model
4. **Popup auto-closes or clicks outside** → settings saved
5. **Clicks speaker icon** → uses new settings

## Design Patterns

### Button Styling
- Follows existing message action button pattern
- Size: `size-3! p-4!` (matches other action buttons)
- Variant: `ghost` (subtle, non-intrusive)
- Icon size: Standard lucide-react icon size

### Popup Styling
- Width: `w-80` (320px)
- Alignment: `align="start"` (left-aligned with button)
- Background: Card background with proper contrast
- Spacing: `space-y-4` for sections, `space-y-2` for labels

### Color Scheme
- Primary actions: Default theme colors
- Active state: Highlighted
- Muted text: `text-muted-foreground`
- Error text: `text-destructive`

### Responsive Behavior
- Works on all screen sizes
- Touch-friendly button sizes
- Popup adjusts to viewport
- Settings panel scrolls if needed

## Accessibility

- ✅ Keyboard navigable (tab through buttons)
- ✅ Screen reader labels (ARIA labels on buttons)
- ✅ Clear visual states (playing vs. stopped)
- ✅ Error messages clearly displayed
- ✅ Tooltips provide context
- ✅ Focus indicators on interactive elements

## Integration Points

The TTS button integrates with:

1. **Message Actions Row**: Appears alongside Copy, Refresh, Delete buttons
2. **Theme System**: Respects light/dark mode
3. **Loading States**: Shows spinner during API calls
4. **Error Handling**: Displays errors inline in settings
5. **Audio System**: Uses browser's native audio element

## Technical Notes

### Component Hierarchy
```
AssistMessagePart (message-parts.tsx)
  └─ showActions div
     ├─ TTSButton (tts-button.tsx)
     │  ├─ Speaker/Mute Button (with Tooltip)
     │  └─ Settings Button (with Tooltip)
     │     └─ Popover
     │        └─ Settings Content
     │           ├─ Model Select
     │           └─ Voice Select
     ├─ Copy Button
     ├─ Refresh Model Button
     └─ Delete Button
```

### State Management
- Local state for model/voice selection
- useTTS hook manages audio playback
- No global state needed (isolated to component)

### Performance
- Lazy loading: Audio only loads when play is clicked
- Caching: SWR caches voice list
- Cleanup: Audio resources properly released
- Debouncing: Settings changes don't spam API

## Future Enhancements Mockup

### Progress Bar (Future)
```
┌─────────────────────────────────────────┐
│ [🔊] [⏸] [10s] ▬▬▬▬▬●▬▬▬▬▬ [30s]      │
│   ↑    ↑    ↑        ↑          ↑       │
│  Play Pause Time   Progress   Duration │
└─────────────────────────────────────────┘
```

### Download Button (Future)
```
[🔊] [⚙️] [⬇️]
  ↑    ↑    ↑
 Play Set Download
```

### Speed Control (Future)
```
┌─────────────────────────────────────────┐
│ Speed: [0.5x] [1x] [1.5x] [2x]        │
└─────────────────────────────────────────┘
```

## Brand Consistency

The TTS feature maintains consistency with the rest of the application:
- Uses existing UI components (Button, Tooltip, Popover, Select)
- Follows spacing/sizing conventions
- Respects theme colors
- Matches icon style (lucide-react)
- Maintains accessibility standards
