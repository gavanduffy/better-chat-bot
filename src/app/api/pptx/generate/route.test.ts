import { describe, it, expect, vi, beforeEach } from "vitest";
import JSZip from "jszip";

// Mock the logger
vi.mock("logger", () => ({
  default: {
    withDefaults: () => ({
      info: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

// Helper to create a mock request
function createMockRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/pptx/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("PPTX Generate API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate that HTML with slides produces a valid PPTX buffer", async () => {
    // Import the route handler dynamically to get fresh mocks
    const { POST } = await import("@/app/api/pptx/generate/route");

    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Test Presentation</title></head>
      <body>
        <section class="slide">
          <h1>Slide 1 Title</h1>
          <p>This is the first slide content.</p>
          <ul>
            <li>Bullet point 1</li>
            <li>Bullet point 2</li>
          </ul>
        </section>
        <section class="slide">
          <h2>Slide 2 Title</h2>
          <p>Second slide content.</p>
        </section>
      </body>
      </html>
    `;

    const request = createMockRequest({
      html,
      title: "Test Presentation",
    });

    const response = await POST(request as any);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
    expect(response.headers.get("Content-Disposition")).toContain(
      "test-presentation.pptx",
    );

    // Verify the response is a valid ZIP file (PPTX is a ZIP archive)
    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);

    // Verify it's a valid ZIP by trying to read it
    const zip = await JSZip.loadAsync(buffer);
    const files = Object.keys(zip.files);

    // PPTX files should contain these essential files
    expect(files).toContain("[Content_Types].xml");
  });

  it("should handle HTML without explicit slides", async () => {
    const { POST } = await import("@/app/api/pptx/generate/route");

    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Single Page Title</h1>
        <p>Some content here.</p>
      </body>
      </html>
    `;

    const request = createMockRequest({
      html,
      title: "Single Slide",
    });

    const response = await POST(request as any);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
  });

  it("should accept pre-parsed slides", async () => {
    const { POST } = await import("@/app/api/pptx/generate/route");

    const request = createMockRequest({
      html: "",
      title: "Pre-parsed Slides",
      slides: [
        {
          title: "First Slide",
          elements: [
            { type: "text", content: "Hello World", y: 1.5 },
            { type: "bullet", content: "Point 1", y: 2.1 },
          ],
        },
        {
          title: "Second Slide",
          elements: [{ type: "text", content: "More content" }],
        },
      ],
    });

    const response = await POST(request as any);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
  });

  it("should return error for invalid request body", async () => {
    const { POST } = await import("@/app/api/pptx/generate/route");

    const request = createMockRequest({
      // Missing required 'html' field
      title: "Invalid Request",
    });

    const response = await POST(request as any);

    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe("Invalid request body");
  });

  it("should handle slides with background colors", async () => {
    const { POST } = await import("@/app/api/pptx/generate/route");

    const request = createMockRequest({
      html: "",
      title: "Styled Slides",
      slides: [
        {
          title: "Colored Slide",
          background: "#4472C4",
          elements: [
            { type: "text", content: "White text on blue", color: "#FFFFFF" },
          ],
        },
      ],
    });

    const response = await POST(request as any);

    expect(response.status).toBe(200);
  });
});
