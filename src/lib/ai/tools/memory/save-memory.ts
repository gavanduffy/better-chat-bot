import { z } from "zod";
import { tool } from "ai";
import { memoryRepository } from "lib/db/repository";

export const createSaveMemoryTool = (userId: string) => tool({
  description: "Save a permanent fact about the user. Use this when the user explicitly asks you to remember something, or when you extract a new permanent fact about the user (e.g. their name, profession, preferences, etc.) from the conversation.",
  inputSchema: z.object({
    fact: z.string().describe("The fact to remember about the user."),
  }),
  execute: async ({ fact }) => {
    await memoryRepository.saveMemory(userId, fact);
    return { success: true, message: "Memory saved." };
  },
});
