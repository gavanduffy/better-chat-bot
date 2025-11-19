# HTML Artifacts / Canvas

HTML Artifacts (also known as Canvas in some AI assistants) allow the AI to create interactive HTML documents that are rendered directly in the chat interface. This feature is similar to Claude Artifacts and Gemini Canvas.

## Quick Start

To enable HTML Artifacts in your chat:

1. Open chat preferences (click the settings icon or press `⌘P`)
2. Navigate to the "Tools" section
3. Enable the **"Artifact"** toolkit
4. Start chatting! The AI can now create interactive HTML artifacts

## Overview

The HTML Artifact feature enables the AI to:

- Create interactive web pages, applications, or demos
- Build data visualizations using HTML/CSS/JavaScript
- Develop interactive forms, calculators, or tools
- Create educational demonstrations or interactive examples
- Build games or animations

All artifacts are rendered in a secure, sandboxed iframe to ensure safety.

## How It Works

When you ask the AI to create something interactive or visual, it can use the `html-artifact` tool to generate a complete HTML document. The artifact will appear in the chat with:

- **Preview Tab**: Shows the rendered HTML in an iframe
- **Code Tab**: Displays the HTML source code
- **Controls**: Copy to clipboard, download as .html file, expand/collapse

## Usage Examples

### Example 1: Interactive Calculator

```
Create an interactive calculator with a clean design
```

The AI will generate a complete HTML artifact with:
- A functional calculator interface
- CSS styling
- JavaScript for calculations
- Interactive buttons and display

### Example 2: Data Visualization

```
Create a bar chart showing monthly sales data using Chart.js
```

The AI will:
- Load Chart.js from CDN
- Create an HTML page with a canvas element
- Initialize and render the chart with data
- Style the page appropriately

### Example 3: Interactive Game

```
Create a simple tic-tac-toe game
```

The AI will build:
- Game board UI with HTML/CSS
- Game logic in JavaScript
- Interactive click handlers
- Win/lose detection

### Example 4: Educational Demo

```
Create an interactive demonstration of how a binary search works with animation
```

The AI will create:
- Visual representation of the algorithm
- Step-by-step animation
- Interactive controls
- Educational explanations

### Example 5: Multi-Page Portfolio Website

```
Create a multi-page portfolio website with a home page, about page, and projects page. 
Use shared CSS for consistent styling and separate JS files for each page's functionality.
```

The AI will generate:
- `index.html` - Home page with navigation
- `pages/about.html` - About page
- `pages/projects.html` - Projects showcase
- `styles/main.css` - Shared styles
- `styles/responsive.css` - Responsive design rules
- `scripts/navigation.js` - Navigation logic
- `scripts/animations.js` - Page animations
- Downloads as a ZIP file with proper folder structure

### Example 6: Data Dashboard with Configuration

```
Create a data dashboard that loads configuration from a JSON file and displays 
multiple charts. Include sample data files and documentation.
```

The AI will create:
- `index.html` - Main dashboard page
- `data/config.json` - Dashboard configuration
- `data/sales.json` - Sample sales data
- `data/users.json` - Sample user data
- `styles/dashboard.css` - Dashboard styling
- `src/charts.js` - Chart rendering logic
- `src/data-loader.js` - Data loading utilities
- `README.md` - Documentation for the project

### Example 7: Component Library

```
Create a reusable component library with multiple HTML example pages showing different components
```

The AI will generate:
- `index.html` - Component library overview
- `examples/buttons.html` - Button examples
- `examples/forms.html` - Form examples
- `examples/cards.html` - Card examples
- `components/button.js` - Button component
- `components/form.js` - Form component
- `styles/components.css` - Component styles
- `styles/themes.css` - Theme variations

## Technical Details

### Tool Configuration

The HTML artifact tool is part of the "Artifact" toolkit. It's automatically available when the toolkit is enabled in your chat preferences.

**Tool Name**: `html-artifact`

**Input Schema**:
```typescript
{
  title: string;           // Short, descriptive title
  description: string | null;  // Brief description (optional)
  html: string;           // Complete HTML document (main entry point)
  files?: Array<{         // Optional array of additional files
    path: string;         // File path (can include folders, e.g., 'src/app.js')
    content: string;      // File content
    type: 'css' | 'js' | 'ts' | 'html' | 'json' | 'md' | 'svg' | 'txt' | 'xml';
  }>;
}
```

### Supported Features

**Multi-File Projects**:
- Support for complex project structures with multiple files
- Folder organization (e.g., `src/`, `styles/`, `data/`)
- Multiple HTML pages (e.g., `index.html`, `about.html`, `contact.html`)
- Automatic ZIP download for projects with multiple files

**Supported File Types**:
- **HTML** (`.html`) - Additional pages beyond the main index.html
- **CSS** (`.css`) - Stylesheets
- **JavaScript** (`.js`) - Scripts
- **TypeScript** (`.ts`) - TypeScript files (auto-transpiled)
- **JSON** (`.json`) - Data and configuration files
- **Markdown** (`.md`) - Documentation files
- **SVG** (`.svg`) - Vector graphics
- **XML** (`.xml`) - Structured data
- **Text** (`.txt`) - Plain text files

**HTML/CSS/JavaScript**:
- Full HTML5 support
- CSS3 styling (inline or in `<style>` tags)
- JavaScript (in `<script>` tags)
- External libraries via CDN

**Popular CDN Libraries**:
- TailwindCSS: `https://cdn.tailwindcss.com`
- D3.js: `https://d3js.org/d3.v7.min.js`
- Chart.js: `https://cdn.jsdelivr.net/npm/chart.js`
- Three.js: `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js`
- Plotly: `https://cdn.plot.ly/plotly-latest.min.js`

### Security

All artifacts are rendered in a sandboxed iframe with the following restrictions:

```html
sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
```

This ensures:
- Scripts can run within the artifact
- Forms and interactive elements work
- The artifact cannot access your data or cookies
- The artifact cannot navigate the parent page
- The artifact cannot access external resources (except CDN links in the HTML)

## User Interface

### Preview Mode
- Default view showing the rendered artifact
- Adjustable height (400px or 600px when expanded)
- Fully interactive - all JavaScript runs normally

### Code Mode
- Syntax-highlighted HTML source code
- Scrollable view for long documents
- Easy to copy and learn from

### Files Mode (Multi-File Projects)
- File tree navigation with folder structure
- Click to view any file in the project
- Syntax highlighting for all supported file types
- Visual icons for different file types:
  - 📄 HTML files
  - 🎨 CSS files
  - 📜 JavaScript files
  - 📘 TypeScript files
  - 📋 JSON files
  - 📝 Markdown files
  - 🖼️ SVG files
  - 📑 XML files

### Controls
- **Copy**: Copy the HTML source to clipboard
- **Download**: Download the artifact
  - Single file: Downloads as `.html` file
  - Multi-file project: Downloads as `.zip` file with full folder structure
- **Expand/Collapse**: Toggle between 400px and 600px height (Preview only)
- **Tab Switch**: Switch between Preview, Code, and Files views

## Best Practices

### For Users

1. **Be Specific**: Clearly describe what you want the artifact to do
2. **Mention Libraries**: If you want a specific library (like Chart.js), mention it
3. **Provide Data**: If you need a chart or table, provide the data or describe the structure
4. **Request Features**: Ask for specific interactive features you want
5. **Request Multi-File Structure**: Ask for separate files when building larger projects
   - Example: "Create a website with separate HTML pages, CSS files, and JavaScript modules"
6. **Specify Folder Structure**: Mention if you want organized folders
   - Example: "Organize the code with src/, styles/, and data/ folders"

### For the AI

The AI is instructed to:
- Include complete HTML structure (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)
- Use inline CSS and JavaScript for simple, self-contained artifacts
- Create multi-file projects with proper organization for complex applications
- Use the `path` property to organize files in folders (e.g., `src/app.js`, `styles/main.css`)
- Load external libraries via CDN when appropriate
- Ensure artifacts are responsive and work on different screen sizes
- Add helpful titles and descriptions
- Create multiple HTML pages when building multi-page websites
- Include configuration and data files (JSON) when needed
- Add documentation files (Markdown) for complex projects

## Troubleshooting

### Artifact Not Rendering

If an artifact appears blank:
- Check the Code tab to see if there are any JavaScript errors
- Ensure all CDN URLs are correct and accessible
- Verify the HTML structure is complete

### Interactive Features Not Working

If buttons or interactions don't work:
- Check that JavaScript is included in the HTML
- Look for console errors in the Code tab
- Ensure event listeners are properly attached

### Styling Issues

If the artifact doesn't look right:
- Check that CSS is included (in `<style>` tags or inline)
- Verify that external CSS CDN links are loaded
- Check for CSS conflicts with the iframe rendering

## Examples in Action

### Simple Interactive Page

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    button {
      padding: 20px 40px;
      font-size: 20px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.1);
    }
  </style>
</head>
<body>
  <button onclick="alert('Hello from the artifact!')">Click Me!</button>
</body>
</html>
```

## Related Features

- **Code Execution Tools**: For running JavaScript/Python code snippets
- **Data Visualization Tools**: For creating charts and tables
- **Image Generation**: For creating AI-generated images

## Feedback

If you have suggestions for improving the HTML Artifact feature, please:
- Open an issue on GitHub
- Share your use case in Discord
- Contribute examples or documentation improvements
