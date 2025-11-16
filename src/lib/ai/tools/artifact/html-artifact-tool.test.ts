import { describe, it, expect } from "vitest";
import { htmlArtifactTool } from "./html-artifact-tool";

describe("htmlArtifactTool", () => {
  it("should be defined", () => {
    expect(htmlArtifactTool).toBeDefined();
  });

  it("should have a description", () => {
    expect(htmlArtifactTool.description).toBeTruthy();
    expect(htmlArtifactTool.description).toContain("HTML artifact");
  });

  it("should have correct input schema", () => {
    const schema = htmlArtifactTool.inputSchema;
    expect(schema).toBeDefined();

    // Test that the schema accepts valid input
    const validInput = {
      title: "Test Artifact",
      description: "A test artifact",
      html: "<!DOCTYPE html><html><body>Hello</body></html>",
    };

    const result = schema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should require title and html fields", () => {
    const schema = htmlArtifactTool.inputSchema;

    // Missing title
    const missingTitle = {
      description: "A test",
      html: "<html></html>",
    };
    expect(schema.safeParse(missingTitle).success).toBe(false);

    // Missing html
    const missingHtml = {
      title: "Test",
      description: "A test",
    };
    expect(schema.safeParse(missingHtml).success).toBe(false);
  });

  it("should allow null description", () => {
    const schema = htmlArtifactTool.inputSchema;

    const inputWithNullDesc = {
      title: "Test Artifact",
      description: null,
      html: "<!DOCTYPE html><html><body>Hello</body></html>",
    };

    const result = schema.safeParse(inputWithNullDesc);
    expect(result.success).toBe(true);
  });

  it("should execute successfully", async () => {
    const result = await htmlArtifactTool.execute({
      title: "Test",
      description: null,
      html: "<html></html>",
    });

    expect(result).toBe("Artifact created successfully");
  });
});
