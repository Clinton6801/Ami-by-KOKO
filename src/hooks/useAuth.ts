"use client";

import { useChild } from "./useChild";
import type { ChildWithClass } from "@/types";

/**
 * Combined auth hook that returns active child info.
 * Useful for components that need child context with class information.
 */
export function useAuth() {
  const { activeChild, loading } = useChild();

  return {
    child: activeChild as ChildWithClass | null,
    loading,
  };
}
