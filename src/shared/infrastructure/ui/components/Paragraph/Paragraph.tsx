import React from "react";
import "./Paragraph.scss";
import { computedClassNames } from "../../../utils/computedClassNames";

export type ParagraphSize = "xs" | "sm" | "base" | "md" | "lg" | "xl" | "2xl";
export type ParagraphWeight = "normal" | "medium" | "semibold" | "bold";
export type ParagraphAlign = "left" | "center" | "right" | "justify";
export type ParagraphColor = "heading" | "heading-light" | "dark" | "medium" | "black" | "muted" | "white";

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: ParagraphSize;
  weight?: ParagraphWeight;
  align?: ParagraphAlign;
  color?: ParagraphColor;
  hasShadow?: boolean;
}

export function Paragraph({
  children,
  className = "",
  size = "base",
  weight = "normal",
  align = "left",
  color = "dark",
  hasShadow = false,
  ...props
}: ParagraphProps) {
  const paragraphClassNames = computedClassNames({
    paragraph: true,
    [`paragraph--${size}`]: !!size,
    [`paragraph--${weight}`]: !!weight,
    [`paragraph--${align}`]: !!align,
    [`paragraph--color-${color}`]: !!color,
    "paragraph--with-shadow": hasShadow,
    [className]: className,
  });

  return (
    <p {...props} className={paragraphClassNames}>
      {children}
    </p>
  );
}
