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
Include all necessary HTML structure (<!DOCTYPE html>, <html>, <head>, <body> tags).
You can use inline CSS in <style> tags and JavaScript in <script> tags.
External libraries can be loaded via CDN (e.g., <script src="https://cdn.jsdelivr.net/...">).

For styling, you can use:
- Inline styles or <style> tags
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
        "Complete HTML document including DOCTYPE, html, head, and body tags. Include inline CSS and JavaScript as needed.",
      ),
  }),
  execute: async () => {
    return "Artifact created successfully";
  },
});
