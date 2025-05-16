import { useState, useEffect } from "react";
import { Breakpoint } from "../lib/styles";

export const useIsMobile = () => {
  // Track if we're on mobile viewport (using window.matchMedia if available)
  const [isMobile, setIsMobile] = useState(false);

  // Media query effect to detect screen size
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia(
        `(max-width: ${Breakpoint.LAPTOP}px)`,
      );

      // Set initial value
      setIsMobile(mediaQuery.matches);

      // Add listener for changes
      const handleResize = (e) => {
        setIsMobile(e.matches);
      };

      mediaQuery.addEventListener("change", handleResize);
      return () => mediaQuery.removeEventListener("change", handleResize);
    }
  }, []);

  return isMobile;
};
