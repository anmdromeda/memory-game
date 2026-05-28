import React from "react";
import "./Surface.scss";
import { computedClassNames } from "../../../utils/computedClassNames";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Surface({ children, className = "", ...props }: SurfaceProps) {
  const surfaceClassNames = computedClassNames({ surface: true, [className]: className });

  return (
    <div className={surfaceClassNames} {...props}>
      {children}
    </div>
  );
}
