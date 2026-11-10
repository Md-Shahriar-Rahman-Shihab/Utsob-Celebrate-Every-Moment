import { describe, it, expect } from "vitest";
import {
  canvasDocumentSchema,
  createCardSchema,
  MAX_CANVAS_OBJECTS,
} from "@/features/cards/schemas/card.schema";

describe("Canvas Document Schema & Security Validation", () => {
  const validCanvasDocument = {
    version: "1.0.0" as const,
    dimensions: {
      width: 1080,
      height: 1920,
      unit: "px" as const,
    },
    backgroundColor: "#ffffff",
    fontsUsed: ["Hind Siliguri", "Anek Bangla"],
    objects: [
      {
        id: "obj-1",
        type: "textbox" as const,
        left: 100,
        top: 200,
        text: "শুভ নববর্ষ!",
        fontSize: 48,
        fontFamily: "Hind Siliguri",
        fill: "#DC2626",
        textAlign: "center" as const,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        opacity: 1,
        originX: "left" as const,
        originY: "top" as const,
        selectable: true,
        locked: false,
        fontStyle: "normal" as const,
        lineHeight: 1.2,
        charSpacing: 0,
      },
      {
        id: "obj-2",
        type: "image" as const,
        left: 50,
        top: 50,
        src: "https://res.cloudinary.com/utsob/image/upload/v1/stickers/alpona.webp",
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        opacity: 1,
        originX: "left" as const,
        originY: "top" as const,
        selectable: true,
        locked: false,
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

  describe("URL Protocol & SSRF Restrictions", () => {
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

    it("should reject unencrypted plain HTTP image URLs", () => {
      const insecureCanvas = {
        ...validCanvasDocument,
        objects: [
          {
            id: "http-obj",
            type: "image",
            left: 0,
            top: 0,
            src: "http://example.com/unencrypted.png",
          },
        ],
      };
      const result = canvasDocumentSchema.safeParse(insecureCanvas);
      expect(result.success).toBe(false);
    });

    it("should reject data: URIs containing potentially executable SVG payloads", () => {
      const dataUriCanvas = {
        ...validCanvasDocument,
        objects: [
          {
            id: "data-obj",
            type: "image",
            left: 0,
            top: 0,
            src: "data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+",
          },
        ],
      };
      const result = canvasDocumentSchema.safeParse(dataUriCanvas);
      expect(result.success).toBe(false);
    });

    it("should reject SSRF target URLs (localhost, 127.0.0.1, AWS/GCP metadata IP)", () => {
      const ssrfTargets = [
        "https://localhost/admin",
        "https://127.0.0.1:8080/secret",
        "https://169.254.169.254/latest/meta-data/",
        "https://10.0.0.1/internal",
        "https://192.168.1.1/router",
      ];

      for (const target of ssrfTargets) {
        const ssrfCanvas = {
          ...validCanvasDocument,
          objects: [
            {
              id: "ssrf-obj",
              type: "image",
              left: 0,
              top: 0,
              src: target,
            },
          ],
        };
        const result = canvasDocumentSchema.safeParse(ssrfCanvas);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("CSS & Color Injection Prevention", () => {
    it("should reject CSS expressions or url() in color fields", () => {
      const maliciousColors = [
        "url('https://evil.com/leak')",
        "expression(alert(1))",
        "javascript:void(0)",
        "<script>alert(1)</script>",
      ];

      for (const badColor of maliciousColors) {
        const poisonedCanvas = {
          ...validCanvasDocument,
          backgroundColor: badColor,
        };
        const result = canvasDocumentSchema.safeParse(poisonedCanvas);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("SVG Path Injection Prevention", () => {
    it("should allow valid SVG path definitions", () => {
      const pathCanvas = {
        ...validCanvasDocument,
        objects: [
          {
            id: "path-1",
            type: "path",
            left: 0,
            top: 0,
            path: "M 10 10 L 100 100 A 45 45 0 0 1 200 200 Z",
            fill: "#000000",
          },
        ],
      };
      const result = canvasDocumentSchema.safeParse(pathCanvas);
      expect(result.success).toBe(true);
    });

    it("should reject SVG path definitions containing script tags or XML injection", () => {
      const maliciousPathCanvas = {
        ...validCanvasDocument,
        objects: [
          {
            id: "bad-path",
            type: "path",
            left: 0,
            top: 0,
            path: "M 0 0 <script>alert(1)</script>",
          },
        ],
      };
      const result = canvasDocumentSchema.safeParse(maliciousPathCanvas);
      expect(result.success).toBe(false);
    });
  });

  describe("Denial of Service (DoS) Limits & Nesting Protections", () => {
    it("should reject canvas documents exceeding maximum allowed objects count", () => {
      const excessiveObjects = Array.from({ length: MAX_CANVAS_OBJECTS + 1 }, (_, i) => ({
        id: `obj-${i}`,
        type: "rect" as const,
        left: 0,
        top: 0,
        fill: "#ff0000",
      }));

      const bloatedCanvas = {
        ...validCanvasDocument,
        objects: excessiveObjects,
      };

      const result = canvasDocumentSchema.safeParse(bloatedCanvas);
      expect(result.success).toBe(false);
    });

    it("should reject nested groups inside groups (preventing recursion bombs)", () => {
      const nestedGroupCanvas = {
        ...validCanvasDocument,
        objects: [
          {
            id: "parent-group",
            type: "group",
            left: 0,
            top: 0,
            objects: [
              {
                id: "child-group",
                type: "group", // Illegal: nested group
                left: 0,
                top: 0,
                objects: [],
              },
            ],
          },
        ],
      };
      const result = canvasDocumentSchema.safeParse(nestedGroupCanvas);
      expect(result.success).toBe(false);
    });
  });

  describe("Card Mutation Schema", () => {
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
});
