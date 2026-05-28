import "./AuthFormSurface.scss";
import { Surface } from "../../../../../../shared/infrastructure/ui/components/Surface";

interface AuthFormSurfaceProps {
  children: React.ReactNode;
}

export function AuthFormSurface({ children }: AuthFormSurfaceProps) {
  return (
    <div className="auth-form-surface-container">
      <Surface className="auth-form-surface">{children}</Surface>
    </div>
  );
}
