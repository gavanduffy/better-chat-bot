"use client";

import { useState } from "react";
import { Volume2, VolumeX, Loader2, Settings } from "lucide-react";
import { Button } from "ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui/select";
import { Label } from "ui/label";
import { useTTS } from "@/hooks/use-tts";
import { TTS_MODELS, type TTSModelConfig } from "@/lib/tts/tts-config";
import { cn } from "lib/utils";

interface TTSButtonProps {
  text: string;
  className?: string;
}

export function TTSButton({ text, className }: TTSButtonProps) {
  const [selectedModel, setSelectedModel] = useState<TTSModelConfig>(
    TTS_MODELS[0],
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    TTS_MODELS[0].voices[0].id,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Dummy API key for now - in production, this should come from user settings
  const apiKey = "dummy-key";

  const { speak, stop, isPlaying, isLoading, error } = useTTS({
    apiKey,
    provider: selectedModel.provider,
    model: selectedModel.model,
    voice: selectedVoiceId,
  });

  const handleSpeak = async () => {
    if (isPlaying) {
      stop();
    } else {
      await speak(text);
    }
  };

  const handleModelChange = (modelId: string) => {
    const model = TTS_MODELS.find(
      (m) => `${m.provider}-${m.model}` === modelId,
    );
    if (model) {
      setSelectedModel(model);
      setSelectedVoiceId(model.voices[0].id);
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-3! p-4!"
            onClick={handleSpeak}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : isPlaying ? (
              <VolumeX />
            ) : (
              <Volume2 />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isPlaying ? "Stop" : "Speak"} ({selectedModel.displayName})
        </TooltipContent>
      </Tooltip>

      <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-3! p-4!">
                <Settings className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>TTS Settings</TooltipContent>
        </Tooltip>

        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Text-to-Speech Settings</h4>
              <p className="text-xs text-muted-foreground">
                Choose your preferred voice model and voice
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="tts-model" className="text-xs">
                  Model
                </Label>
                <Select
                  value={`${selectedModel.provider}-${selectedModel.model}`}
                  onValueChange={handleModelChange}
                >
                  <SelectTrigger id="tts-model" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TTS_MODELS.map((model) => (
                      <SelectItem
                        key={`${model.provider}-${model.model}`}
                        value={`${model.provider}-${model.model}`}
                      >
                        {model.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tts-voice" className="text-xs">
                  Voice
                </Label>
                <Select
                  value={selectedVoiceId}
                  onValueChange={handleVoiceChange}
                >
                  <SelectTrigger id="tts-voice" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedModel.voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span>{voice.name}</span>
                          {voice.description && (
                            <span className="text-xs text-muted-foreground">
                              {voice.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive">Error: {error}</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
