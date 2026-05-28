import React from "react";

interface ColorCardContentProps {
  color: string;
}

export const ColorCardContent: React.FC<ColorCardContentProps> = ({ color }) => {
  return (
    <div
      className="game-card-color-wrapper"
      style={{ backgroundColor: color }}
      aria-label={`Carta de color ${color}`}
    />
  );
};
