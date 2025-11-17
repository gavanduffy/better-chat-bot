# Text-to-Speech (TTS) Feature

## Overview

The TTS feature allows users to listen to AI assistant responses using high-quality text-to-speech models from multiple providers via the APIpie.ai API.

## Setup

### 1. Get an API Key

1. Sign up at [APIpie.ai](https://apipie.ai)
2. Navigate to [API Keys](https://apipie.ai/profile/api-keys)
3. Create a new API key

### 2. Configure Environment Variable

Add your APIpie.ai API key to the `.env` file:

```bash
APIPIE_API_KEY=your_api_key_here
```

## Features

### Supported Providers

The TTS feature supports the following voice providers through APIpie.ai:

1. **ElevenLabs** (Recommended for best quality)
   - Flash v2.5 - Latest, fastest generation
   - Multilingual v2 - Best quality, 30+ languages
   - Turbo v2.5 - Fast generation with quality

2. **OpenAI**
   - TTS HD - High-definition voices
   - TTS Standard - Standard quality voices

3. **Cartesia**
   - Sonic 2 - Latest model

4. **Deepgram**
   - Aura - Natural speech synthesis

### Available Voices

Each model comes with multiple voice options:

#### ElevenLabs Voices
- **Rachel** - Young female, American, calm (great for narration)
- **Drew** - Middle-aged male, American
- **Antoni** - Young male, American (well-rounded narrator)
- **Thomas** - Young male, American (calm meditation voice)
- **Bill** - Older male, American (trustworthy narration)
- **Sarah** - Young female, American (soft news voice)
- **Daniel** - Middle-aged male, British (authoritative news)

#### OpenAI Voices
- **Alloy** - Versatile and balanced
- **Echo** - Warm and natural
- **Fable** - Engaging storyteller
- **Onyx** - Deep and authoritative
- **Nova** - Bright and energetic
- **Shimmer** - Clear and expressive

## Usage

### In the Chat Interface

1. **Locate the TTS Button**: After the AI assistant responds, you'll see a speaker icon (🔊) at the bottom of the message.

2. **Play Audio**: Click the speaker icon to convert the message text to speech and play it.

3. **Stop Audio**: Click the icon again (it will show 🔇) to stop the audio playback.

4. **Configure Settings**: Click the settings icon (⚙️) next to the speaker icon to:
   - Select a different TTS model/provider
   - Choose a different voice
   - See voice descriptions

### Settings Panel

The TTS settings panel allows you to:

- **Choose Model**: Select from various providers (ElevenLabs, OpenAI, Cartesia, Deepgram)
- **Select Voice**: Pick a voice that matches your preference
- **View Descriptions**: See voice characteristics (age, gender, accent, use case)

## Technical Details

### API Endpoints

The feature uses the following internal API routes:

- `POST /api/tts/synthesize` - Converts text to speech
- `GET /api/tts/voices` - Fetches available voices (optional, for dynamic loading)

### Architecture

1. **Client Component** (`tts-button.tsx`): Renders the TTS button and settings UI
2. **React Hook** (`use-tts.ts`): Manages audio playback state and lifecycle
3. **API Routes**: Proxy requests to APIpie.ai to keep the API key secure
4. **Type Definitions** (`tts.ts`): TypeScript types for TTS requests and responses

### Request Format

The TTS API accepts requests in the following format:

```typescript
{
  provider: "openai" | "elevenlabs" | "cartesia" | "deepgram",
  model: string,
  input: string,           // Text to convert
  voice: string,           // Voice ID
  speed?: number,          // 0.25-4.0 (optional)
  responseFormat?: string, // e.g., "mp3" (optional)
  voiceSettings?: {        // ElevenLabs only (optional)
    stability?: number,
    similarity_boost?: number,
    style?: number,
    use_speaker_boost?: boolean
  }
}
```

## Cost Considerations

- TTS services incur usage costs through APIpie.ai
- Costs vary by provider and model:
  - ElevenLabs: Pay per character
  - OpenAI: Pay per character
  - Cartesia: Pay per character
  - Deepgram: Pay per character
- Check the `X-Audio-Details` response header for cost information
- Monitor your usage at [APIpie.ai Profile](https://apipie.ai/profile)

## Performance

- **Latency**: Varies by provider (200ms - 2000ms typical)
- **Quality**: ElevenLabs Multilingual v2 offers the highest quality
- **Speed**: ElevenLabs Flash v2.5 offers the fastest generation

## Troubleshooting

### "APIPIE_API_KEY not configured" Error

Make sure you've:
1. Created an API key at APIpie.ai
2. Added it to your `.env` file as `APIPIE_API_KEY`
3. Restarted the application

### No Audio Plays

Check:
1. Browser audio permissions
2. Volume settings
3. Console for error messages
4. Network tab for failed API requests

### Voice Not Available

- Some voices may only be available with specific models
- Check the APIpie.ai documentation for the latest voice availability
- Use the `/api/tts/voices` endpoint to fetch current available voices

## Future Enhancements

Potential improvements for future versions:

1. **User Preferences**: Save preferred model and voice per user
2. **Streaming**: Support streaming audio for real-time playback
3. **Voice Customization**: Advanced settings for pitch, speed, and emphasis
4. **Audio Controls**: Progress bar, skip, and replay controls
5. **Download Option**: Allow users to download generated audio files
6. **Multi-language Support**: Automatic language detection and voice selection

## Resources

- [APIpie.ai Documentation](https://apipie.ai/docs)
- [APIpie.ai Voice Documentation](https://apipie.ai/docs/Features/Voices)
- [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
- [OpenAI TTS Documentation](https://platform.openai.com/docs/guides/text-to-speech)
