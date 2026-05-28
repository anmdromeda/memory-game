import React from "react";

interface TextCardContentProps {
  text: string;
}

export const TextCardContent: React.FC<TextCardContentProps> = ({ text }) => {
  return (
    <div className="game-card-text-wrapper" data-testid="text-card-content">
      <span className="game-card-text-wrapper__text">{text}</span>
    </div>
  );
};
