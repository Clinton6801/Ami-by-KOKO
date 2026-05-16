"use client";

/**
 * Thin client wrapper around ErrorBoundary for use in server layouts.
 * React requires error boundaries to be client components, but they
 * can't be imported directly into server components without this wrapper.
 */
import { type ReactNode } from "react";
import ErrorBoundary from "./ErrorBoundary";

export default function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
