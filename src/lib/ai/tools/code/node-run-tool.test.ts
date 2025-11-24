import { describe, expect, it } from "vitest";
import { nodeExecutionTool } from "./node-run-tool";

describe("nodeExecutionTool", () => {
  it("should be defined", () => {
    expect(nodeExecutionTool).toBeDefined();
  });

  it("should have a description", () => {
    expect(nodeExecutionTool.description).toBeTruthy();
    expect(nodeExecutionTool.description).toContain("Node.js");
  });

  it("should have correct input schema", () => {
    expect(nodeExecutionTool.inputSchema).toBeDefined();
  });

  it("should have description mentioning Node.js features", () => {
    expect(nodeExecutionTool.description).toContain("server-side");
    expect(nodeExecutionTool.description).toContain("npm packages");
  });
});
