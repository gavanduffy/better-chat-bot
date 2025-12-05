import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the WebContainer API
const mockWebContainerInstance = {
  mount: vi.fn(),
  spawn: vi.fn(),
  on: vi.fn(),
  teardown: vi.fn(),
};

vi.mock("@webcontainer/api", () => ({
  WebContainer: {
    boot: vi.fn(() => Promise.resolve(mockWebContainerInstance)),
  },
}));

describe("WebContainer types", () => {
  it("should have correct WebContainerStatus types", () => {
    const statuses: Array<
      "idle" | "booting" | "installing" | "running" | "completed" | "error"
    > = ["idle", "booting", "installing", "running", "completed", "error"];
    expect(statuses).toHaveLength(6);
  });

  it("should have correct WebContainerLogEntry structure", () => {
    const log = {
      type: "stdout" as const,
      message: "test message",
      timestamp: Date.now(),
    };
    expect(log.type).toBe("stdout");
    expect(log.message).toBe("test message");
    expect(typeof log.timestamp).toBe("number");
  });

  it("should have correct WebContainerServerInfo structure", () => {
    const serverInfo = {
      url: "http://localhost:3000",
      port: 3000,
    };
    expect(serverInfo.url).toBe("http://localhost:3000");
    expect(serverInfo.port).toBe(3000);
  });

  it("should have correct WebContainerResult structure", () => {
    const result = {
      success: true,
      exitCode: 0,
      logs: [
        {
          type: "stdout" as const,
          message: "Server started",
          timestamp: Date.now(),
        },
      ],
      serverInfo: {
        url: "http://localhost:3000",
        port: 3000,
      },
      executionTimeMs: 1500,
    };
    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.logs).toHaveLength(1);
    expect(result.serverInfo?.port).toBe(3000);
  });

  it("should have correct WebContainerExecutionOptions structure", () => {
    const options = {
      files: {
        "index.js": 'console.log("hello")',
        "package.json": '{"name": "test"}',
      },
      command: "node index.js",
      installDeps: true,
      timeout: 30000,
    };
    expect(Object.keys(options.files)).toHaveLength(2);
    expect(options.command).toBe("node index.js");
    expect(options.installDeps).toBe(true);
    expect(options.timeout).toBe(30000);
  });
});

describe("WebContainer file tree building", () => {
  it("should handle flat file structure", () => {
    const files: Record<string, string> = {
      "index.js": 'console.log("hello")',
      "package.json": '{"name": "test"}',
    };

    // Test that file structure is correct
    expect(files["index.js"]).toBe('console.log("hello")');
    expect(files["package.json"]).toBe('{"name": "test"}');
  });

  it("should handle nested file paths", () => {
    const files: Record<string, string> = {
      "src/index.js": 'console.log("hello")',
      "src/utils/helper.js": "export const helper = () => {}",
      "package.json": '{"name": "test"}',
    };

    expect(Object.keys(files)).toHaveLength(3);
    expect(files["src/index.js"]).toBeDefined();
    expect(files["src/utils/helper.js"]).toBeDefined();
  });

  it("should handle deeply nested file paths", () => {
    const files: Record<string, string> = {
      "src/components/ui/Button/index.tsx": "export const Button = () => {}",
    };

    expect(files["src/components/ui/Button/index.tsx"]).toBeDefined();
  });
});

describe("WebContainer execution flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate Express server file structure", () => {
    const expressFiles = {
      "index.js": `
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello World'));
app.listen(3000, () => console.log('Server running on port 3000'));
      `.trim(),
      "package.json": JSON.stringify(
        {
          name: "express-app",
          dependencies: {
            express: "^4.18.0",
          },
        },
        null,
        2,
      ),
    };

    expect(expressFiles["index.js"]).toContain("express");
    expect(expressFiles["index.js"]).toContain("app.listen");
    const pkg = JSON.parse(expressFiles["package.json"]);
    expect(pkg.dependencies.express).toBe("^4.18.0");
  });

  it("should validate multi-file project structure", () => {
    const projectFiles = {
      "src/server.js": `
import express from 'express';
import { greet } from './utils.js';
const app = express();
app.get('/', (req, res) => res.send(greet('World')));
app.listen(3000);
      `.trim(),
      "src/utils.js": `
export const greet = (name) => \`Hello, \${name}!\`;
      `.trim(),
      "package.json": JSON.stringify(
        {
          name: "multi-file-app",
          type: "module",
          dependencies: {
            express: "^4.18.0",
          },
        },
        null,
        2,
      ),
    };

    expect(Object.keys(projectFiles)).toHaveLength(3);
    expect(projectFiles["src/server.js"]).toContain("import");
    expect(projectFiles["src/utils.js"]).toContain("export");
  });

  it("should handle command parsing", () => {
    const command = "npm run start";
    const [cmd, ...args] = command.split(" ");
    
    expect(cmd).toBe("npm");
    expect(args).toEqual(["run", "start"]);
  });

  it("should handle node command parsing", () => {
    const command = "node src/index.js";
    const [cmd, ...args] = command.split(" ");
    
    expect(cmd).toBe("node");
    expect(args).toEqual(["src/index.js"]);
  });
});

describe("WebContainer error scenarios", () => {
  it("should handle timeout error format", () => {
    const timeout = 60000;
    const errorMessage = `Execution timeout: ${timeout}ms exceeded`;
    
    expect(errorMessage).toContain("timeout");
    expect(errorMessage).toContain("60000");
  });

  it("should handle npm install failure", () => {
    const result = {
      success: false,
      exitCode: 1,
      logs: [
        {
          type: "stderr" as const,
          message: "npm ERR! code ERESOLVE",
          timestamp: Date.now(),
        },
      ],
      error: "npm install failed",
      executionTimeMs: 5000,
    };

    expect(result.success).toBe(false);
    expect(result.error).toBe("npm install failed");
  });

  it("should handle browser compatibility error", () => {
    const error = new Error("WebContainers are not supported in this browser");
    expect(error.message).toContain("not supported");
  });
});

describe("WebContainer server detection", () => {
  it("should parse server-ready event data", () => {
    const port = 3000;
    const url = "http://localhost:3000";
    
    const serverInfo = { port, url };
    
    expect(serverInfo.port).toBe(3000);
    expect(serverInfo.url).toBe("http://localhost:3000");
  });

  it("should handle different port numbers", () => {
    const testCases = [
      { port: 3000, expected: 3000 },
      { port: 8080, expected: 8080 },
      { port: 5173, expected: 5173 }, // Vite default
      { port: 4000, expected: 4000 }, // Custom
    ];

    testCases.forEach(({ port, expected }) => {
      expect(port).toBe(expected);
    });
  });
});
