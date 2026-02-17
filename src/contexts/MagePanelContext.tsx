'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type MagePanelContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const MagePanelContext = createContext<MagePanelContextValue | null>(null);

export function MagePanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  return (
    <MagePanelContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </MagePanelContext.Provider>
  );
}

export function useMagePanel() {
  const ctx = useContext(MagePanelContext);
  if (!ctx) throw new Error('useMagePanel must be used within MagePanelProvider');
  return ctx;
}
