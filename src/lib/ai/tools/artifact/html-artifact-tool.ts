import { tool as createTool } from "ai";
import { z } from "zod";

export const htmlArtifactTool = createTool({
  description: `Create an interactive artifact or multi-file project that will be rendered in the chat.
This tool provides full Claude-compatible artifact capabilities including HTML, React, Mermaid diagrams, SVG, and more.

Use this tool to create:
- Interactive web pages, applications, or demos
- React components and applications
- Data visualizations (charts, graphs, interactive diagrams)
- Mermaid diagrams (flowcharts, sequence diagrams, etc.)
- SVG graphics and animations
- Interactive forms, calculators, or tools
- Educational demonstrations or interactive examples
- Games or animations
- Complete project codebases with multiple files and folders
- Node.js scripts and server-side code

The artifact will be rendered appropriately based on the artifact type:
- HTML artifacts: rendered in a sandboxed iframe with full HTML, CSS, and JavaScript support
- React artifacts: rendered with React runtime
- Mermaid artifacts: rendered as diagrams
- SVG artifacts: rendered as scalable vector graphics
- Code artifacts: displayed with syntax highlighting

You can provide either:
1. A single HTML file with inline CSS and JavaScript
2. React components (JSX/TSX)
3. Mermaid diagram code
4. SVG code
5. Multiple separate files (HTML, CSS, JS, TS, JSX, TSX, JSON, Markdown, etc.) for better organization
6. Complex project structures with folders and multiple pages
7. Node.js code with npm package dependencies

For single-file artifacts:
- Include all necessary HTML structure (<!DOCTYPE html>, <html>, <head>, <body> tags)
- Use inline CSS in <style> tags and JavaScript in <script> tags
- For React, provide JSX/TSX components
- For Mermaid, provide valid Mermaid syntax
- For SVG, provide valid SVG markup

For multi-file artifacts and projects:
- Provide separate files for HTML, CSS, JavaScript, TypeScript, React (JSX/TSX), JSON, Markdown, SVG, etc.
- Use file paths with folders (e.g., 'src/app.js', 'styles/main.css', 'components/Button.jsx')
- The main HTML file should reference other files using relative paths
- JavaScript/TypeScript/React files will be automatically bundled and injected
- You can create multiple HTML pages (e.g., 'index.html', 'about.html', 'contact.html')

For styling, you can use:
- Inline styles or <style> tags
- Separate CSS files
- TailwindCSS via CDN: https://cdn.tailwindcss.com
- Other CSS libraries via CDN

For JavaScript/React libraries, you can use CDN links like:
- React: https://esm.sh/react@18 and https://esm.sh/react-dom@18
- D3.js: https://d3js.org/d3.v7.min.js
- Chart.js: https://cdn.jsdelivr.net/npm/chart.js
- Three.js: https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js
- Any other CDN-hosted libraries

For Node.js artifacts:
- Specify required npm packages in the 'packages' array
- Packages will be available for import in your code
- Use for server-side processing, file operations, or Node.js APIs

Examples of multi-file projects:
- A React application with multiple components, state management, and routing
- A portfolio website with multiple pages (index.html, about.html, contact.html) and shared CSS/JS
- A game with separate files for game logic, rendering, and data
- A data dashboard with configuration files, data files, and visualization scripts
- A documentation site with multiple markdown files converted to HTML
- A Node.js script that processes data using npm packages`,

  inputSchema: z.object({
    title: z
      .string()
      .describe(
        "A short, descriptive title for the artifact (e.g., 'Interactive Calculator', 'React Todo App', 'Flowchart Diagram')",
      ),
    description: z
      .string()
      .nullable()
      .describe(
        "A brief description of what the artifact does or demonstrates",
      ),
    artifactType: z
      .enum(["html", "react", "mermaid", "svg", "node", "code"])
      .default("html")
      .describe(
        "Type of artifact: 'html' (web page), 'react' (React component), 'mermaid' (diagram), 'svg' (vector graphic), 'node' (Node.js code), 'code' (code snippet)",
      ),
    html: z
      .string()
      .describe(
        "Main content: HTML document for 'html' type, JSX/TSX for 'react', Mermaid syntax for 'mermaid', SVG markup for 'svg', Node.js code for 'node', or code for 'code' type. For HTML artifacts, include complete HTML structure (DOCTYPE, html, head, body tags). This is the main entry point for the artifact.",
      ),
    files: z
      .array(
        z.object({
          path: z
            .string()
            .describe(
              "File path relative to the root, can include folders (e.g., 'styles.css', 'src/app.js', 'components/Button.jsx', 'data/config.json')",
            ),
          content: z.string().describe("The content of the file"),
          type: z
            .enum([
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
            ])
            .describe(
              "File type: css, js (JavaScript), ts (TypeScript), jsx (React JSX), tsx (React TSX), html, json, md (Markdown), svg, txt, or xml",
            ),
        }),
      )
      .optional()
      .describe(
        "Optional array of additional files to be included in the artifact. Use 'path' to organize files in folders. For React artifacts, include component files. For Node.js, include module files. Reference these files appropriately based on artifact type.",
      ),
    packages: z
      .array(z.string())
      .optional()
      .describe(
        "For Node.js artifacts: array of npm package names to install (e.g., ['lodash', 'axios']). Packages will be available for import in the code.",
      ),
  }),
  execute: async () => {
    return "Artifact created successfully";
  },
});
