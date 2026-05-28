import React from "react";
import "./Badge.scss";
import { computedClassNames } from "../../../utils/computedClassNames";
import { Heading } from "../Heading";

export type BadgeVariant = "primary" | "secondary" | "container";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function Badge({ children, variant = "primary", size = "md", className = "", ...props }: BadgeProps) {
  const badgeClassName = computedClassNames({
    badge: true,
    [`badge--${variant}`]: !!variant,
    [`badge--${size}`]: !!size,
    [className]: className,
  });

  return (
    <div {...props} className={badgeClassName}>
      <Heading type="h1" color="black" size="lg">
        {children}
      </Heading>
    </div>
  );
}
