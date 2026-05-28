import React, { useId } from "react";
import "./Input.scss";
import { computedClassNames } from "../../../utils/computedClassNames";
import { Heading } from "../Heading";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  onIconClick?(): void;
}

export function Input({ label, error, helperText, icon, disabled, className = "", onIconClick, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = props.id || generatedId;

  const inputContainerClasses = computedClassNames({
    "input-container--disabled": disabled,
    "input-container--error": error,
    "input-container": true,
    [className]: className,
  });

  return (
    <div className={inputContainerClasses}>
      {label && (
        <label htmlFor={inputId} className="input-container__label">
          <Heading type="h3" size="lg">
            {label}
          </Heading>
        </label>
      )}

      <div className="input-container__field-wrapper">
        <input
          {...props}
          id={inputId}
          disabled={disabled}
          className={`input-container__element ${icon ? "input-container__element--has-icon" : ""}`}
        />

        {icon && (
          <button type="button" className="input-container__icon" onClick={onIconClick}>
            {icon}
          </button>
        )}
      </div>

      {error ? (
        <span className="input-container__error-message">{error}</span>
      ) : helperText ? (
        <span className="input-container__helper-text">{helperText}</span>
      ) : null}
    </div>
  );
}
