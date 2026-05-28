import React from "react";
import "./Spinner.scss";
import { computedClassNames } from "../../../utils/computedClassNames";

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerVariant = "primary" | "secondary";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
}

export function Spinner({ size = "md", variant = "primary", className = "", ...props }: SpinnerProps) {
  const spinnerClassName = computedClassNames({
    spinner: true,
    [`spinner--${size}`]: !!size,
    [`spinner--${variant}`]: !!variant,
    [className]: className,
  });

  return (
    <div {...props} className={spinnerClassName}>
      <div className="spinner__ring" />
    </div>
  );
}
