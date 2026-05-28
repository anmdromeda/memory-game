import React from "react";
import "./Button.scss";
import { computedClassNames } from "../../../utils/computedClassNames";

export type ButtonVariant = "primary" | "secondary";
export type ButtonTone = "base" | "medium" | "darken";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  isLoading?: boolean;
}

export function Button({
  label,
  variant = "primary",
  tone = "base",
  isLoading = false,
  className = "",
  disabled,
  children,
  ...restProps
}: ButtonProps) {
  const buttonClassName = computedClassNames({
    "button--loading": isLoading,
    [`button--${variant}`]: !!variant,
    [`button--${tone}`]: variant === "primary" || variant === "secondary",
    [className]: className,
    button: true,
  });

  return (
    <button className={buttonClassName} disabled={disabled || isLoading} {...restProps}>
      <span className="button__text">{label || children}</span>
    </button>
  );
}
