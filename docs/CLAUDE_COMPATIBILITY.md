# Claude Agent Skills Compatibility

This document describes the Claude-compatible artifact system implemented in Better Chatbot, providing full feature parity with Claude's artifact capabilities.

## Overview

Better Chatbot now supports all major Claude artifact types, allowing AI models to create interactive content, visualizations, and code projects that are rendered directly in the chat interface.

## Supported Artifact Types

### 1. HTML Artifacts (Default)
Create interactive web pages with HTML, CSS, and JavaScript.

**Use cases:**
- Interactive web applications
- Games and animations
- Data visualizations
- Forms and calculators
- Educational demonstrations

**Features:**
- Full HTML5 support
- Inline or separate CSS files
- JavaScript execution in sandboxed iframe
- CDN library support (D3.js, Chart.js, Three.js, etc.)
- TailwindCSS support via CDN

**Example:**
```json
{
  "title": "Interactive Calculator",
  "artifactType": "html",
  "html": "<!DOCTYPE html><html>...</html>"
}
```

### 2. React Artifacts
Create React components and applications with JSX/TSX.

**Use cases:**
- Interactive UI components
- Single-page applications
- React-based visualizations
- Component libraries

**Features:**
- JSX/TSX support
- Multiple component files
- State management
- React hooks support
- CDN React library integration

**Example:**
```json
{
  "title": "Todo App",
  "artifactType": "react",
  "html": "function TodoApp() { return <div>...</div>; }",
  "files": [
    {
      "path": "components/TodoItem.jsx",
      "content": "export function TodoItem({ text }) { return <li>{text}</li>; }",
      "type": "jsx"
    }
  ]
}
```

### 3. Mermaid Diagrams
Create flowcharts, sequence diagrams, and other diagram types using Mermaid syntax.

**Use cases:**
- Flowcharts
- Sequence diagrams
- Gantt charts
- Entity relationship diagrams
- State diagrams

**Features:**
- Full Mermaid syntax support
- Interactive diagrams
- Multiple diagram types

**Example:**
```json
{
  "title": "Process Flowchart",
  "artifactType": "mermaid",
  "html": "graph TD;\n    A[Start] --> B[Process];\n    B --> C[End];"
}
```

### 4. SVG Artifacts
Create scalable vector graphics with SVG markup.

**Use cases:**
- Vector illustrations
- Icons and logos
- Animated graphics
- Data visualizations
- Infographics

**Features:**
- Full SVG specification support
- CSS styling
- JavaScript animations
- Interactive elements

**Example:**
```json
{
  "title": "Animated Circle",
  "artifactType": "svg",
  "html": "<svg width=\"200\" height=\"200\"><circle cx=\"100\" cy=\"100\" r=\"50\" /></svg>"
}
```

### 5. Node.js Artifacts
Execute Node.js code with npm package support.

**Use cases:**
- Server-side computations
- Data processing
- File operations
- Working with npm packages
- API integrations

**Features:**
- Full Node.js API access
- npm package installation
- Multiple module files
- Async/await support

**Example:**
```json
{
  "title": "Data Processing Script",
  "artifactType": "node",
  "html": "const _ = require('lodash');\nconsole.log(_.VERSION);",
  "packages": ["lodash", "axios"]
}
```

### 6. Code Artifacts
Display code snippets with syntax highlighting.

**Use cases:**
- Code examples
- Documentation
- Code sharing
- Algorithm demonstrations

**Example:**
```json
{
  "title": "Python Example",
  "artifactType": "code",
  "html": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)"
}
```

## Multi-File Projects

All artifact types support multiple files for better organization:

```json
{
  "title": "React Portfolio",
  "artifactType": "react",
  "html": "<!DOCTYPE html><html>...",
  "files": [
    {
      "path": "components/Header.jsx",
      "content": "export function Header() { ... }",
      "type": "jsx"
    },
    {
      "path": "styles/main.css",
      "content": "body { margin: 0; }",
      "type": "css"
    },
    {
      "path": "utils/helpers.js",
      "content": "export function formatDate() { ... }",
      "type": "js"
    },
    {
      "path": "data/config.json",
      "content": "{\"title\": \"My Portfolio\"}",
      "type": "json"
    }
  ]
}
```

## Supported File Types

- **css** - Cascading Style Sheets
- **js** - JavaScript
- **ts** - TypeScript
- **jsx** - React JSX
- **tsx** - React TypeScript
- **html** - HTML files
- **json** - JSON data
- **md** - Markdown
- **svg** - SVG files
- **txt** - Plain text
- **xml** - XML files

## Security

All artifacts are executed in secure, sandboxed environments:

- **HTML/React artifacts**: Rendered in sandboxed iframes
- **JavaScript**: No access to DOM, localStorage, or browser APIs that could compromise security
- **Node.js**: Isolated execution environment
- **Code validation**: Dangerous patterns are detected and blocked

## Node.js Execution Tool

In addition to Node.js artifacts, there's a dedicated Node.js execution tool for running server-side code:

```typescript
{
  "code": "const fs = require('fs'); console.log('Hello Node.js');",
  "packages": ["lodash", "axios"]
}
```

This tool is useful for:
- One-off server-side computations
- Testing npm packages
- File system operations
- Working with Node.js APIs

## Usage in Chat

When using AI models, they can automatically create artifacts by invoking the `html-artifact` tool. The artifact type is determined by the `artifactType` parameter, and the appropriate rendering is applied automatically.

Example prompt:
```
Create a React todo application with add, delete, and complete functionality.
```

The AI will create a React artifact with the appropriate components and functionality.

## Artifact UI Features

The artifact viewer includes:
- **Preview tab**: Live preview of the artifact
- **Code tab**: View the main HTML/code
- **Files tab**: Browse and view all project files (for multi-file projects)
- **Download**: Download as single HTML file or ZIP archive (for multi-file projects)
- **Copy**: Copy code to clipboard
- **Expand**: Full-screen preview mode

## Differences from Claude

While we aim for full compatibility with Claude's artifact system, there are some implementation differences:

1. **Rendering**: We use iframe sandboxing and client-side execution rather than server-side rendering
2. **React**: We use CDN-loaded React rather than a build process
3. **Node.js**: This is a unique feature not available in Claude's web interface
4. **Package Management**: For Node.js artifacts, packages are specified explicitly rather than auto-detected

## Best Practices

1. **Choose the right artifact type**: Use HTML for web apps, React for component-based UIs, Mermaid for diagrams
2. **Organize with multiple files**: Split large projects into logical files and folders
3. **Use descriptive titles**: Help users understand what the artifact does
4. **Add descriptions**: Provide context about the artifact's purpose
5. **Leverage CDN libraries**: Use CDN links for libraries instead of bundling
6. **Test incrementally**: Start simple and add complexity gradually

## Examples

See the test files for comprehensive examples:
- `src/lib/ai/tools/artifact/html-artifact-tool.test.ts`
- Live demos at https://better-chatbot-demo.vercel.app/

## API Reference

### Artifact Tool Schema

```typescript
{
  title: string;              // Required: Short, descriptive title
  description: string | null; // Optional: Brief description
  artifactType: "html" | "react" | "mermaid" | "svg" | "node" | "code"; // Default: "html"
  html: string;              // Required: Main content/code
  files?: Array<{            // Optional: Additional files
    path: string;            // File path with folders
    content: string;         // File content
    type: "css" | "js" | "ts" | "jsx" | "tsx" | "html" | "json" | "md" | "svg" | "txt" | "xml";
  }>;
  packages?: string[];       // Optional: npm packages for Node.js artifacts
}
```

## Troubleshooting

**Artifact not rendering**: Check browser console for errors, ensure HTML is well-formed

**React components not working**: Ensure React is loaded via CDN in HTML head

**Node.js packages not found**: Verify package names in the `packages` array

**Files not loading**: Check file paths are relative and correctly referenced

## Future Enhancements

Planned improvements:
- WebContainers for full Node.js environment
- Real-time collaborative editing
- Version history for artifacts
- Export to various formats
- Integration with external services
