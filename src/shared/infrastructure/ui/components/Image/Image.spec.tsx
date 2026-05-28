import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { Image } from "../Image";

describe("<Image /> - Shared Atomic Component", () => {
  const defaultProps = {
    src: "https://domain.com/assets/avatar.png",
    alt: "User profile picture",
  };

  describe("Lifecycle & Async Status Transitions", () => {
    it("should display the skeleton loader initially and hide the image element via structural visibility classes", () => {
      render(<Image {...defaultProps} />);

      expect(screen.getByTestId("image-skeleton")).toBeInTheDocument();

      const imgElement = screen.getByRole("img", { name: defaultProps.alt });
      expect(imgElement).toHaveClass("is-hidden");
      expect(imgElement).not.toHaveClass("is-visible");
    });

    it("should switch state to 'loaded', clear the skeleton, and set the image visible when onLoad fires", () => {
      render(<Image {...defaultProps} />);

      const imgElement = screen.getByRole("img", { name: defaultProps.alt });

      fireEvent.load(imgElement);

      expect(screen.queryByTestId("image-skeleton")).toBeNull();
      expect(imgElement).toHaveClass("is-visible");
      expect(imgElement).not.toHaveClass("is-hidden");
    });

    it("should switch state to 'error', unmount the img tag, and render the default fallback icon when onError fires", () => {
      render(<Image {...defaultProps} />);

      const imgElement = screen.getByRole("img", { name: defaultProps.alt });

      fireEvent.error(imgElement);

      expect(screen.queryByTestId("image-skeleton")).toBeNull();
      expect(screen.queryByRole("img")).toBeNull();

      const errorContainer = screen.getByTestId("image-error");
      expect(errorContainer).toBeInTheDocument();
      expect(errorContainer).toHaveTextContent("🖼️❌");
    });

    it("should mount a custom fallbackElement node instead of the default icon if provided on error", () => {
      const customFallback = <span data-testid="custom-fallback">No image available</span>;
      render(<Image {...defaultProps} fallbackElement={customFallback} />);

      const imgElement = screen.getByRole("img", { name: defaultProps.alt });
      fireEvent.error(imgElement);

      expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
      expect(screen.queryByText("🖼️❌")).toBeNull();
    });
  });

  describe("Styles & Layout Layout Propagation", () => {
    it("should apply container size and forward structural custom style injections", () => {
      const customStyle: React.CSSProperties = { border: "1px solid red" };
      const { container } = render(
        <Image {...defaultProps} width="200px" height="150px" style={customStyle} className="avatar-frame" />,
      );

      const containerElement = container.firstChild as HTMLElement;

      expect(containerElement).toHaveClass("base-image-container", "avatar-frame");
      expect(containerElement.style.width).toBe("200px");
      expect(containerElement.style.height).toBe("150px");
      expect(containerElement.style.border).toBe("1px solid red");
    });

    it("should forward object-fit and object-position properties directly to the native img element styles", () => {
      render(<Image {...defaultProps} objectFit="cover" objectPosition="top center" />);

      const imgElement = screen.getByRole("img", { name: defaultProps.alt });

      expect(imgElement.style.objectFit).toBe("cover");
      expect(imgElement.style.objectPosition).toBe("top center");
    });
  });
});
