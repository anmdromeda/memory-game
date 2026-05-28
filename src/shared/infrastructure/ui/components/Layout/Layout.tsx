import React from "react";
import "./Layout.scss";
import { computedClassNames } from "../../../utils/computedClassNames";

export interface LayoutProps {
  children: React.ReactNode;
  navbar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Layout({ children, navbar, footer, className = "" }: LayoutProps) {
  const layoutClassNames = computedClassNames({ layout: true, [className]: className });

  return (
    <div className={layoutClassNames}>
      {navbar ? (
        <header className="layout__header" role="banner">
          {navbar}
        </header>
      ) : null}

      <main className="layout__content" role="main">
        {children}
      </main>

      {footer ? (
        <footer className="layout__footer" role="contentinfo">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
