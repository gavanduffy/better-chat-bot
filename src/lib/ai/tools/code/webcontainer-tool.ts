import { JSONSchema7 } from "json-schema";
import { tool as createTool } from "ai";
import { jsonSchemaToZod } from "lib/json-schema-to-zod";

const filesDescription = `Object mapping file paths to their contents. Example:
{
  "index.js": "const express = require('express');\\nconst app = express();\\napp.get('/', (req, res) => res.send('Hello'));\\napp.listen(3000);",
  "package.json": "{\\"dependencies\\": {\\"express\\": \\"^4.18.0\\"}}"
}`;

const commandDescription = `The command to execute after files are mounted and dependencies installed.
Examples:
- "node index.js" - Run a Node.js script
- "npm start" - Run the start script from package.json
- "npm run dev" - Run the dev script from package.json`;

export const webcontainerExecutionSchema: JSONSchema7 = {
  type: "object",
  properties: {
    files: {
      type: "object",
      additionalProperties: {
        type: "string",
      },
      description: filesDescription,
    },
    command: {
      type: "string",
      description: commandDescription,
    },
    installDeps: {
      type: "boolean",
      description:
        "Whether to run npm install before executing the command. Defaults to true if package.json has dependencies.",
    },
  },
  required: ["files", "command"],
};

export const webcontainerExecutionTool = createTool({
  description: `Execute Node.js projects in a WebContainer sandbox. Use this for:
- Full Node.js applications with npm dependencies (Express, Fastify, etc.)
- Multi-file projects with imports/exports
- REST API servers that need live preview URLs
- Build tools and bundlers (webpack, vite, rollup)
- Frontend frameworks setup examples

The WebContainer provides a full Node.js environment in the browser with npm support.
When a server starts, users see a live preview URL they can interact with.
Include all necessary files including package.json with dependencies.
The container persists between calls, so subsequent executions can build on previous state.

For simple scripts without dependencies, prefer the JavaScript execution tool instead.`,

  inputSchema: jsonSchemaToZod(webcontainerExecutionSchema),
});
