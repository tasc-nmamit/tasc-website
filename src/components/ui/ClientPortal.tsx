"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

interface ClientPortalProps {
  children: React.ReactNode;
  selector?: string;
}

const emptySubscribe = () => () => {};

export default function ClientPortal({ children, selector }: ClientPortalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isMounted || typeof document === "undefined") {
    return null;
  }

  const target = selector ? document.querySelector(selector) : document.body;
  if (!target) return null;

  return createPortal(children, target);
}
