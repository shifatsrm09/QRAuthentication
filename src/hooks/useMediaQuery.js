import { useEffect, useState } from "react";

const supportsMatchMedia = () => typeof window !== "undefined" && typeof window.matchMedia === "function";

// Tracks a CSS media query, e.g. useMediaQuery("(min-width: 769px)").
// Returns false where matchMedia is unavailable (tests, very old browsers).
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => supportsMatchMedia() && window.matchMedia(query).matches);

  useEffect(() => {
    if (!supportsMatchMedia()) return undefined;
    const mql = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
