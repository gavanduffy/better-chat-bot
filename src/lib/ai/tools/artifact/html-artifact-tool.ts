import { tool as createTool } from "ai";
import { z } from "zod";

export const htmlArtifactTool = createTool({
  description: `Create an interactive HTML artifact or multi-file project that will be rendered in the chat.
Use this tool to create:
- Interactive web pages, applications, or demos
- Multi-page websites with multiple HTML files
- Data visualizations using HTML/CSS/JavaScript
- Interactive forms, calculators, or tools
- Educational demonstrations or interactive examples
- Games or animations
- Complete project codebases with multiple files and folders

The artifact will be rendered in a sandboxed iframe with full HTML, CSS, and JavaScript support.

You can provide either:
1. A single HTML file with inline CSS and JavaScript
2. Multiple separate files (HTML, CSS, JS, TS, JSON, Markdown, etc.) for better organization
3. Complex project structures with folders and multiple pages

For single-file artifacts:
- Include all necessary HTML structure (<!DOCTYPE html>, <html>, <head>, <body> tags)
- Use inline CSS in <style> tags and JavaScript in <script> tags

For multi-file artifacts and projects:
- Provide separate files for HTML, CSS, JavaScript, TypeScript, JSON, Markdown, SVG, etc.
- Use file paths with folders (e.g., 'src/app.js', 'styles/main.css', 'data/config.json')
- The main HTML file should reference other files using relative paths
- JavaScript/TypeScript files will be automatically bundled and injected
- You can create multiple HTML pages (e.g., 'index.html', 'about.html', 'contact.html')

For styling, you can use:
- Inline styles or <style> tags
- Separate CSS files
- TailwindCSS via CDN: https://cdn.tailwindcss.com
- Other CSS libraries via CDN

For JavaScript libraries, you can use CDN links like:
- D3.js: https://d3js.org/d3.v7.min.js
- Chart.js: https://cdn.jsdelivr.net/npm/chart.js
- Three.js: https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js
- Any other CDN-hosted libraries

Examples of multi-file projects:
- A portfolio website with multiple pages (index.html, about.html, contact.html) and shared CSS/JS
- A game with separate files for game logic, rendering, and data
- A data dashboard with configuration files, data files, and visualization scripts
- A documentation site with multiple markdown files converted to HTML`,

  inputSchema: z.object({
    title: z
      .string()
      .describe(
        "A short, descriptive title for the artifact (e.g., 'Interactive Calculator', 'Portfolio Website', 'Task Manager App')",
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
        "Complete HTML document including DOCTYPE, html, head, and body tags. This is the main entry point (index.html) for the artifact.",
      ),
    files: z
      .array(
        z.object({
          path: z
            .string()
            .describe(
              "File path relative to the root, can include folders (e.g., 'styles.css', 'src/app.js', 'pages/about.html', 'data/config.json')",
            ),
          content: z.string().describe("The content of the file"),
          type: z
            .enum([
              "css",
              "js",
              "ts",
              "html",
              "json",
              "md",
              "svg",
              "txt",
              "xml",
            ])
            .describe(
              "File type: css, js (JavaScript), ts (TypeScript), html, json, md (Markdown), svg, txt, or xml",
            ),
        }),
      )
      .optional()
      .describe(
        "Optional array of additional files to be included in the artifact. Use 'path' to organize files in folders. Reference these files in your HTML using relative paths.",
      ),
  }),
  execute: async () => {
    return "Artifact created successfully";
  },
});
