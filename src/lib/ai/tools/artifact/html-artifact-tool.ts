import { tool as createTool } from "ai";
import { z } from "zod";

export const htmlArtifactTool = createTool({
  description: `Create an interactive HTML artifact that will be rendered in the chat.
Use this tool to create:
- Interactive web pages, applications, or demos
- Data visualizations using HTML/CSS/JavaScript
- Interactive forms, calculators, or tools
- Educational demonstrations or interactive examples
- Games or animations

The artifact will be rendered in a sandboxed iframe with full HTML, CSS, and JavaScript support.

You can provide either:
1. A single HTML file with inline CSS and JavaScript
2. Multiple separate files (HTML, CSS, JS, TS) for better organization

For single-file artifacts:
- Include all necessary HTML structure (<!DOCTYPE html>, <html>, <head>, <body> tags)
- Use inline CSS in <style> tags and JavaScript in <script> tags

For multi-file artifacts:
- Provide separate files for HTML, CSS, JavaScript, or TypeScript
- The HTML file should reference other files using relative paths (e.g., <link rel="stylesheet" href="styles.css">)
- JavaScript/TypeScript files will be automatically bundled and injected

For styling, you can use:
- Inline styles or <style> tags
- Separate CSS files
- TailwindCSS via CDN: https://cdn.tailwindcss.com
- Other CSS libraries via CDN

For JavaScript libraries, you can use CDN links like:
- D3.js: https://d3js.org/d3.v7.min.js
- Chart.js: https://cdn.jsdelivr.net/npm/chart.js
- Three.js: https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js
- Any other CDN-hosted libraries`,

  inputSchema: z.object({
    title: z
      .string()
      .describe(
        "A short, descriptive title for the artifact (e.g., 'Interactive Calculator', 'Solar System Simulation')",
      ),
    description: z
      .string()
      .nullable()
      .describe(
        "A brief description of what the artifact does or demonstrates",
      ),
    html: z
      .string()
      .describe(
        "Complete HTML document including DOCTYPE, html, head, and body tags. This is the main entry point for the artifact.",
      ),
    files: z
      .array(
        z.object({
          name: z
            .string()
            .describe(
              "File name with extension (e.g., 'styles.css', 'app.js', 'utils.ts')",
            ),
          content: z.string().describe("The content of the file"),
          type: z
            .enum(["css", "js", "ts"])
            .describe("File type: css, js (JavaScript), or ts (TypeScript)"),
        }),
      )
      .optional()
      .describe(
        "Optional array of additional files (CSS, JavaScript, TypeScript) to be included in the artifact. Reference these files in your HTML using relative paths.",
      ),
  }),
  execute: async () => {
    return "Artifact created successfully";
  },
});
