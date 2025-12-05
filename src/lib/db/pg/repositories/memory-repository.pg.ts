import { eq, desc } from "drizzle-orm";
import { pgDb } from "../db.pg";
import { UserMemoryTable } from "../schema.pg";

export const pgMemoryRepository = {
  async getMemories(userId: string) {
    const memories = await pgDb
      .select()
      .from(UserMemoryTable)
      .where(eq(UserMemoryTable.userId, userId))
      .orderBy(desc(UserMemoryTable.createdAt));
    return memories;
  },

  async saveMemory(userId: string, fact: string) {
    return await pgDb.insert(UserMemoryTable).values({
      userId,
      fact,
    });
  },
};
