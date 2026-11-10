// Canonical Utsob Canvas Document specification (Fabric.js scene graph)

export type CanvasObjectType =
  | "i-text"
  | "text"
  | "textbox"
  | "image"
  | "rect"
  | "circle"
  | "path"
  | "group"
  | "line";

export interface CanvasDimensions {
  width: number;
  height: number;
  unit: "px";
}

export interface CanvasObjectBase {
  id: string;
  type: CanvasObjectType;
  left: number;
  top: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  originX?: "left" | "center" | "right";
  originY?: "top" | "center" | "bottom";
  selectable?: boolean;
  locked?: boolean;
  name?: string;
}

export interface CanvasTextObject extends CanvasObjectBase {
  type: "i-text" | "text" | "textbox";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight?: string | number;
  fontStyle?: "normal" | "italic";
  fill: string;
  textAlign?: "left" | "center" | "right" | "justify";
  lineHeight?: number;
  charSpacing?: number;
}

export interface CanvasImageObject extends CanvasObjectBase {
  type: "image";
  src: string;
  crossOrigin?: string;
  filters?: unknown[];
}

export interface CanvasShapeObject extends CanvasObjectBase {
  type: "rect" | "circle" | "path" | "line";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export type CanvasObject = CanvasTextObject | CanvasImageObject | CanvasShapeObject | CanvasObjectBase;

export interface CanvasDocument {
  version: "1.0.0";
  dimensions: CanvasDimensions;
  backgroundColor: string;
  backgroundImage?: {
    src: string;
    opacity: number;
  };
  fontsUsed: string[];
  objects: CanvasObject[];
}
