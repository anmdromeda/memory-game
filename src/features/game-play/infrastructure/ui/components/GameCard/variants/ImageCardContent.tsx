import { Image } from "../../../../../../../shared/infrastructure/ui/components/Image";

interface ImageCardContentProps {
  src: string;
  alt: string;
}

export const ImageCardContent = ({ src, alt }: ImageCardContentProps) => {
  return (
    <div className="game-card-image-wrapper">
      <Image src={src} alt={alt} width="100%" height="100%" objectFit="cover" objectPosition="top" />
    </div>
  );
};
