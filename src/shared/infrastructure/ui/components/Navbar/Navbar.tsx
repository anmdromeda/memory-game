import "./Navbar.scss";
import { Image } from "../Image";
import { Badge } from "../Badge";
import { Heading } from "../Heading";

export interface NavbarProps {
  title: string;
  brandLogoSrc?: string;
  showBrandDisplayName?: boolean;
  brandDisplayName?: string;
}

export function Navbar({ title, brandLogoSrc, brandDisplayName, showBrandDisplayName }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar__content">
        {brandLogoSrc ? (
          <Image width="100%" height="170px" src={brandLogoSrc} alt="Navbar brand logo" disableSkeleton />
        ) : null}

        {showBrandDisplayName ? (
          <Heading color="white" className="navbar__brand-display-name" size="3xl">
            {brandDisplayName}
          </Heading>
        ) : null}

        <Badge variant="secondary" size="sm">
          {title}
        </Badge>
      </div>
    </nav>
  );
}
