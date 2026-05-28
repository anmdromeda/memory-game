import React from "react";
import { Spinner } from "../Spinner/Spinner";
import "./SplashScreen.scss";

interface SplashScreenProps {
  message?: string;
  logo?: React.ReactNode;
}

export function SplashScreen({ message, logo }: SplashScreenProps) {
  return (
    <div data-testid="splash-screen" role="status" aria-label="Cargando aplicación" className="splash-screen">
      <div className="splash-screen__content">
        {logo && <div className="splash-screen__logo">{logo}</div>}

        <Spinner size="lg" className="splash-screen__spinner" />

        {message && <p className="splash-screen__message">{message}</p>}
      </div>
    </div>
  );
}
