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

  it("should execute successfully with single file", async () => {
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

  it("should execute successfully with multiple files", async () => {
    if (htmlArtifactTool.execute) {
      const result = await htmlArtifactTool.execute(
        {
          title: "Test Project",
          description: "A test project with multiple files",
          html: "<!DOCTYPE html><html><head></head><body></body></html>",
          files: [
            {
              path: "styles.css",
              content: "body { margin: 0; }",
              type: "css",
            },
            {
              path: "app.js",
              content: "console.log('Hello');",
              type: "js",
            },
            {
              path: "data/config.json",
              content: '{"name": "test"}',
              type: "json",
            },
          ],
        },
        {
          toolCallId: "test-id",
          messages: [],
        },
      );

      expect(result).toBe("Artifact created successfully");
    }
  });

  it("should support various file types", async () => {
    const schema = htmlArtifactTool.inputSchema;
    const fileTypes = [
      "css",
      "js",
      "ts",
      "html",
      "json",
      "md",
      "svg",
      "txt",
      "xml",
    ];

    // Validate that all file types are supported
    const result = schema.safeParse({
      title: "Test",
      description: "Test",
      html: "<html></html>",
      files: fileTypes.map((type, index) => ({
        path: `file${index}.${type}`,
        content: "test content",
        type,
      })),
    });

    expect(result.success).toBe(true);
  });
});
