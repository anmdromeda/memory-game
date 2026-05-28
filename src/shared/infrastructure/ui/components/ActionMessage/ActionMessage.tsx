import "./ActionMessage.scss";
import { Paragraph, type ParagraphSize } from "../Paragraph";
import { Button, type ButtonVariant, type ButtonTone } from "../Button";
import { computedClassNames } from "../../../utils/computedClassNames";

export interface ActionMessageProps {
  message: string;
  actionLabel: string;
  onAction?(): void;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  textSize?: ParagraphSize;
  className?: string;
}

export function ActionMessage({
  message,
  actionLabel,
  onAction,
  variant = "primary",
  tone = "base",
  textSize = "lg",
  className = "",
}: ActionMessageProps) {
  const containerClassName = computedClassNames({
    "action-message": true,
    [className]: className,
  });

  return (
    <div className={containerClassName}>
      <Paragraph size={textSize} align="center" className="action-message__text">
        {message}
      </Paragraph>

      <Button onClick={onAction} variant={variant} tone={tone} className="action-message__button">
        {actionLabel}
      </Button>
    </div>
  );
}
