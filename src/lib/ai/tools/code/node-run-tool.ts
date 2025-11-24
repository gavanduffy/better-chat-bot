import { JSONSchema7 } from "json-schema";
import { tool as createTool } from "ai";
import { jsonSchemaToZod } from "lib/json-schema-to-zod";

const codeDescription = `Node.js code that will be executed server-side. This is useful for:
- File system operations
- Running npm packages
- Server-side computations
- Working with Node.js APIs

Use console.log, console.warn, and console.error to display execution results.

Available Node.js APIs and common packages are available. The code runs in an isolated environment with standard Node.js capabilities.`;

export const nodeExecutionSchema: JSONSchema7 = {
  type: "object",
  properties: {
    code: {
      type: "string",
      description: codeDescription,
    },
    packages: {
      type: "array",
      items: {
        type: "string",
      },
      description:
        "Optional array of npm package names to install before execution (e.g., ['lodash', 'axios'])",
    },
  },
  required: ["code"],
};

export const nodeExecutionTool = createTool({
  description: `Execute Node.js code server-side with access to Node.js APIs and npm packages.
Use this when you need:
- File system operations (fs module)
- Working with npm packages
- Server-side processing
- Node.js specific APIs

For browser-compatible code that doesn't require Node.js features, prefer the JavaScript execution tool instead.`,

  inputSchema: jsonSchemaToZod(nodeExecutionSchema),
});
