"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 384 512"
    className={cn("w-3 transition-transform duration-300", className)}
    aria-hidden
  >
    <path
      fill="currentColor"
      d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
    />
  </svg>
);

const SCROLL_THRESHOLD = 300;

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  const scrollToTop = useCallback(() => {
    const scrollRoot = document.querySelector(
      "main [class*='overflow-y-auto']",
    ) as HTMLElement | null;
    if (scrollRoot) {
      scrollRoot.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const scrollRoot = document.querySelector(
      "main [class*='overflow-y-auto']",
    ) as HTMLElement | null;
    const getScrollTop = () => scrollRoot?.scrollTop ?? window.scrollY;
    const onScroll = () => setVisible(getScrollTop() > SCROLL_THRESHOLD);
    scrollRoot?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      scrollRoot?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-6 right-6",
          "flex items-center justify-center",
          "h-12 w-12 rounded-full",
          "bg-black text-white",
          "shadow-lg",
          "transition-all duration-300",
          "hover:scale-110 active:scale-95",
        )}
        aria-label="Back to top"
      >
        <ChevronUpIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
