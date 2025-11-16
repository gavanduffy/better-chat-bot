import { describe, expect, it } from "vitest";
import { htmlArtifactTool } from "./html-artifact-tool";

describe("htmlArtifactTool", () => {
  it("should be defined", () => {
    expect(htmlArtifactTool).toBeDefined();
  });

  it("should have a description", () => {
    expect(htmlArtifactTool.description).toBeTruthy();
    expect(htmlArtifactTool.description).toContain("artifact");
  });

  it("should have correct input schema", () => {
    expect(htmlArtifactTool.inputSchema).toBeDefined();
  });

  it("should execute successfully", async () => {
    if (htmlArtifactTool.execute) {
      const result = await htmlArtifactTool.execute(
        {
          title: "Test",
          description: null,
          html: "<html></html>",
        },
        {
          toolCallId: "test-id",
          messages: [],
        },
      );

      expect(result).toBe("Artifact created successfully");
    }
  });
});
