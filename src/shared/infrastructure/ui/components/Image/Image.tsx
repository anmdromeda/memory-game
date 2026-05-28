import React, { useState } from "react";
import "./Image.scss";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down";
  objectPosition?: string;
  fallbackElement?: React.ReactNode;
  disableSkeleton?: boolean;
}

export const Image: React.FC<ImageProps> = ({
  draggable = false,
  src,
  alt,
  width = "100%",
  height = "100%",
  fallbackElement,
  className = "",
  objectFit = "contain",
  objectPosition,
  style,
  disableSkeleton = false,
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  const containerStyle: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div className={`base-image-container ${className}`} style={containerStyle} draggable={draggable}>
      {status === "loading" && !disableSkeleton && <div className="base-image-skeleton" data-testid="image-skeleton" />}

      {status === "error" && (
        <div className="base-image-error" data-testid="image-error">
          {fallbackElement || <span className="base-image-error-icon">🖼️❌</span>}
        </div>
      )}

      {status !== "error" && (
        <img
          src={src}
          alt={alt}
          draggable={draggable}
          className={`base-image-element ${status === "loaded" ? "is-visible" : "is-hidden"}`}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          style={{ objectFit, objectPosition }}
        />
      )}
    </div>
  );
};
