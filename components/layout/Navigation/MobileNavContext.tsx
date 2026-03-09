"use client";

import { createContext, useContext, useState, useCallback } from "react";

type MobileNavContextValue = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <MobileNavContext.Provider value={{ mobileNavOpen, setMobileNavOpen }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return ctx;
}
