import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import { z } from "zod";
import globalLogger from "logger";
import { colorize } from "consola/utils";

const logger = globalLogger.withDefaults({
  message: colorize("blackBright", `PPTX API: `),
});

// Maximum input size to prevent ReDoS attacks (10MB)
const MAX_HTML_SIZE = 10 * 1024 * 1024;

// Sanitize filename to prevent path traversal and other issues
function sanitizeFilename(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove multiple consecutive hyphens
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
      .substring(0, 100) || "presentation"
  ); // Limit length and provide fallback
}

// Validate image URL to prevent SSRF attacks
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow https and data URLs
    if (parsed.protocol === "data:") {
      return url.startsWith("data:image/");
    }
    if (parsed.protocol !== "https:") {
      return false;
    }
    // Block localhost, private IPs, and internal networks
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Schema for slide element positioning
const slideElementSchema = z.object({
  type: z.enum(["title", "text", "bullet", "image"]),
  content: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
});

const slideSchema = z.object({
  title: z.string().optional(),
  elements: z.array(slideElementSchema).optional(),
  background: z.string().optional(),
});

const requestBodySchema = z.object({
  html: z.string().max(MAX_HTML_SIZE),
  title: z.string().optional(),
  // Pre-parsed slides can be passed directly
  slides: z.array(slideSchema).optional(),
});

// Parse HTML into slide structure
function parseHtmlToSlides(html: string): z.infer<typeof slideSchema>[] {
  // Input size check to prevent ReDoS
  if (html.length > MAX_HTML_SIZE) {
    throw new Error("HTML content exceeds maximum allowed size");
  }

  const slides: z.infer<typeof slideSchema>[] = [];

  // Create a basic HTML parser using regex for server-side
  // Match <section class="slide"> or <div class="slide"> patterns
  const slideRegex =
    /<(?:section|div)[^>]*class="[^"]*slide[^"]*"[^>]*>([\s\S]*?)<\/(?:section|div)>/gi;
  let match: RegExpExecArray | null;
  const slideMatches: string[] = [];

  while ((match = slideRegex.exec(html)) !== null) {
    slideMatches.push(match[1]);
  }

  // If no explicit slides found, treat entire content as one slide
  if (slideMatches.length === 0) {
    slideMatches.push(html);
  }

  for (const slideContent of slideMatches) {
    const slide: z.infer<typeof slideSchema> = {
      elements: [],
    };

    // Extract title (h1-h6)
    const titleMatch = slideContent.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
    if (titleMatch) {
      slide.title = stripHtmlTags(titleMatch[1]).trim();
    }

    // Extract paragraphs
    const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pMatch: RegExpExecArray | null;
    let yPos = 1.5;

    while ((pMatch = paragraphRegex.exec(slideContent)) !== null) {
      const text = stripHtmlTags(pMatch[1]).trim();
      if (text) {
        slide.elements?.push({
          type: "text",
          content: text,
          y: yPos,
        });
        yPos += 0.6;
      }
    }

    // Extract list items
    const listItemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch: RegExpExecArray | null;

    while ((liMatch = listItemRegex.exec(slideContent)) !== null) {
      const text = stripHtmlTags(liMatch[1]).trim();
      if (text) {
        slide.elements?.push({
          type: "bullet",
          content: text,
          y: yPos,
        });
        yPos += 0.6;
      }
    }

    slides.push(slide);
  }

  return slides;
}

// Strip HTML tags and decode HTML entities from text
// SECURITY NOTE: This function extracts plain text for PPTX slides.
// The output is used as plain text in pptxgenjs addText() which does not
// interpret HTML, so incomplete sanitization is not a security concern here.
// The function is NOT intended for sanitizing HTML for web rendering.
function stripHtmlTags(html: string): string {
  // Remove all HTML tags - apply multiple times to handle nested/malformed tags
  let text = html;
  let previousLength: number;
  do {
    previousLength = text.length;
    text = text.replace(/<[^>]*>/g, "");
  } while (text.length !== previousLength && text.includes("<"));

  // Decode HTML entities in the correct order to prevent double-escaping issues
  // Decode &amp; last since other entities may contain & in their encoded form
  const entityMap: Record<string, string> = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
  };

  for (const [entity, char] of Object.entries(entityMap)) {
    text = text.split(entity).join(char);
  }

  // Decode &amp; last to avoid double-decoding
  text = text.split("&amp;").join("&");

  return text.trim();
}

// Generate PPTX from slides
async function generatePptx(
  slides: z.infer<typeof slideSchema>[],
  title?: string,
): Promise<Buffer> {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.layout = "LAYOUT_16x9";
  pptx.title = title || "Presentation";
  pptx.author = "Better ChatBot";

  // Default colors
  const titleColor = "363636";
  const textColor = "666666";

  for (const slideData of slides) {
    const slide = pptx.addSlide();
    let yPos = 0.5;

    // Apply background if specified
    if (slideData.background) {
      // Remove # if present for pptxgenjs
      const bgColor = slideData.background.replace("#", "");
      slide.background = { color: bgColor };
    }

    // Add title if present
    if (slideData.title) {
      slide.addText(slideData.title, {
        x: 0.5,
        y: yPos,
        w: "90%",
        h: 1,
        fontSize: 24,
        bold: true,
        color: titleColor,
      });
      yPos += 1.0;
    }

    // Add other elements
    if (slideData.elements) {
      for (const element of slideData.elements) {
        const elementY = element.y ?? yPos;
        const elementX = element.x ?? 0.5;
        const elementW = element.w ?? 9;
        const elementH = element.h ?? 0.5;
        const fontSize = element.fontSize ?? 14;
        const color = element.color?.replace("#", "") ?? textColor;

        switch (element.type) {
          case "title":
            slide.addText(element.content, {
              x: elementX,
              y: elementY,
              w: elementW,
              h: 1,
              fontSize: 24,
              bold: true,
              color: titleColor,
            });
            yPos = elementY + 1.0;
            break;

          case "text":
            slide.addText(element.content, {
              x: elementX,
              y: elementY,
              w: elementW,
              h: elementH,
              fontSize: fontSize,
              color: color,
              bold: element.bold,
              italic: element.italic,
              align: element.align,
            });
            yPos = elementY + 0.6;
            break;

          case "bullet":
            slide.addText(element.content, {
              x: elementX,
              y: elementY,
              w: elementW,
              h: elementH,
              fontSize: fontSize,
              color: color,
              bullet: true,
            });
            yPos = elementY + 0.6;
            break;

          case "image":
            // Image handling - content should be a validated URL or base64
            if (isValidImageUrl(element.content)) {
              slide.addImage({
                path: element.content,
                x: elementX,
                y: elementY,
                w: element.w ?? 4,
                h: element.h ?? 3,
              });
              yPos = elementY + (element.h ?? 3) + 0.2;
            }
            break;
        }
      }
    }
  }

  // Generate PPTX as base64 and convert to Buffer
  const output = await pptx.write({ outputType: "base64" });
  return Buffer.from(output as string, "base64");
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const {
      html,
      title,
      slides: preParseSlides,
    } = requestBodySchema.parse(json);

    logger.info(`Generating PPTX: ${title ?? "Untitled"}`);

    // Use pre-parsed slides if provided, otherwise parse HTML
    const slides = preParseSlides ?? parseHtmlToSlides(html);

    if (slides.length === 0) {
      return NextResponse.json(
        {
          error:
            "No slides found. Ensure HTML contains elements with class 'slide' or <section> tags.",
        },
        { status: 400 },
      );
    }

    logger.info(`Parsed ${slides.length} slides`);

    // Generate PPTX
    const pptxBuffer = await generatePptx(slides, title);

    // Create sanitized filename
    const filename = `${sanitizeFilename(title ?? "presentation")}.pptx`;

    // Return PPTX file - convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(pptxBuffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logger.error("PPTX generation failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "PPTX generation failed",
      },
      { status: 500 },
    );
  }
}
