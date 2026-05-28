import React from "react";
import "./Heading.scss";
import { computedClassNames } from "../../../utils/computedClassNames";

export type HeadingColor = "heading" | "heading-light" | "dark" | "medium" | "black" | "muted" | "white";

interface HeadingProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> {
  type?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  align?: "center" | "left" | "right";
  size?: "xs" | "sm" | "base" | "md" | "lg" | "xl" | "2xl" | "3xl";
  color?: HeadingColor;
}

export function Heading({
  type = "h1",
  children,
  className = "",
  align = "left",
  size = "base",
  color = "heading",
  ...props
}: HeadingProps) {
  const headingClassNames = computedClassNames({
    heading: true,
    [`heading--${size}`]: !!size,
    [`heading--${align}`]: !!align,
    [`heading--color-${color}`]: !!color,
    [className]: className,
  });

  return React.createElement(
    type,
    {
      ...props,
      className: headingClassNames,
    },
    children,
  );
}
