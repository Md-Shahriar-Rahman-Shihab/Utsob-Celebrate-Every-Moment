import { describe, it, expect } from "vitest";
import { canvasDocumentSchema, createCardSchema } from "@/features/cards/schemas/card.schema";

describe("Canvas Document Schema & Security Validation", () => {
  const validCanvasDocument = {
    version: "1.0.0",
    dimensions: {
      width: 1080,
      height: 1920,
      unit: "px",
    },
    backgroundColor: "#ffffff",
    fontsUsed: ["Hind Siliguri", "Anek Bangla"],
    objects: [
      {
        id: "obj-1",
        type: "textbox",
        left: 100,
        top: 200,
        text: "শুভ নববর্ষ!",
        fontSize: 48,
        fontFamily: "Hind Siliguri",
        fill: "#DC2626",
        textAlign: "center",
      },
      {
        id: "obj-2",
        type: "image",
        left: 50,
        top: 50,
        src: "https://res.cloudinary.com/utsob/image/upload/v1/stickers/alpona.webp",
      },
    ],
  };

  it("should successfully parse a valid Fabric.js canvas scene graph", () => {
    const result = canvasDocumentSchema.safeParse(validCanvasDocument);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe("1.0.0");
      expect(result.data.dimensions.width).toBe(1080);
      expect(result.data.objects.length).toBe(2);
    }
  });

  it("should reject malicious javascript: protocol URLs on canvas image objects", () => {
    const maliciousCanvas = {
      ...validCanvasDocument,
      objects: [
        {
          id: "evil-obj",
          type: "image",
          left: 0,
          top: 0,
          src: "javascript:alert(document.cookie)",
        },
      ],
    };

    const result = canvasDocumentSchema.safeParse(maliciousCanvas);
    expect(result.success).toBe(false);
  });

  it("should validate createCardSchema with title, dimensions and canvas JSON", () => {
    const cardPayload = {
      title: "বৈশাখী উৎসব কার্ড ২০২৬",
      width: 1080,
      height: 1920,
      canvasJSON: validCanvasDocument,
      isPublic: true,
    };

    const result = createCardSchema.safeParse(cardPayload);
    expect(result.success).toBe(true);
  });

  it("should reject card payload when title is empty", () => {
    const cardPayload = {
      title: "",
      canvasJSON: validCanvasDocument,
    };

    const result = createCardSchema.safeParse(cardPayload);
    expect(result.success).toBe(false);
  });
});
