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

  it("should execute successfully with single HTML file", async () => {
    if (htmlArtifactTool.execute) {
      const result = await htmlArtifactTool.execute(
        {
          title: "Test",
          description: null,
          artifactType: "html",
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
          artifactType: "html",
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
    if (htmlArtifactTool.execute) {
      const fileTypes = [
        "css",
        "js",
        "ts",
        "jsx",
        "tsx",
        "html",
        "json",
        "md",
        "svg",
        "txt",
        "xml",
      ];

      // Test that tool accepts all file types
      const result = await htmlArtifactTool.execute(
        {
          title: "Test All File Types",
          description: "Test all supported file types",
          artifactType: "html",
          html: "<!DOCTYPE html><html><head></head><body></body></html>",
          files: fileTypes.map((type, index) => ({
            path: `file${index}.${type}`,
            content: "test content",
            type: type as
              | "css"
              | "js"
              | "ts"
              | "jsx"
              | "tsx"
              | "html"
              | "json"
              | "md"
              | "svg"
              | "txt"
              | "xml",
          })),
        },
        {
          toolCallId: "test-id",
          messages: [],
        },
      );

      expect(result).toBe("Artifact created successfully");
    }
  });

  it("should support React artifacts", async () => {
    if (htmlArtifactTool.execute) {
      const result = await htmlArtifactTool.execute(
        {
          title: "React Component",
          description: "A simple React component",
          artifactType: "react",
          html: "function App() { return <div>Hello React</div>; }",
        },
        {
          toolCallId: "test-id",
          messages: [],
        },
      );

      expect(result).toBe("Artifact created successfully");
    }
  });

  it("should support Mermaid diagrams", async () => {
    if (htmlArtifactTool.execute) {
      const result = await htmlArtifactTool.execute(
        {
          title: "Flowchart",
          description: "A simple flowchart",
          artifactType: "mermaid",
          html: "graph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;",
        },
        {
          toolCallId: "test-id",
          messages: [],
        },
      );

      expect(result).toBe("Artifact created successfully");
    }
  });

  it("should support SVG artifacts", async () => {
    if (htmlArtifactTool.execute) {
      const result = await htmlArtifactTool.execute(
        {
          title: "SVG Circle",
          description: "A simple SVG circle",
          artifactType: "svg",
          html: '<svg><circle cx="50" cy="50" r="40" /></svg>',
        },
        {
          toolCallId: "test-id",
          messages: [],
        },
      );

      expect(result).toBe("Artifact created successfully");
    }
  });

  it("should support Node.js artifacts with packages", async () => {
    if (htmlArtifactTool.execute) {
      const result = await htmlArtifactTool.execute(
        {
          title: "Node.js Script",
          description: "A Node.js script with dependencies",
          artifactType: "node",
          html: "const _ = require('lodash');\nconsole.log(_.VERSION);",
          packages: ["lodash"],
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
