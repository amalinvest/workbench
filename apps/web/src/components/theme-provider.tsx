"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Thin wrapper around `next-themes`' provider with our project defaults baked
 * in. Splitting it out as a client component keeps the root `layout.tsx`
 * a pure server component.
 *
 * - `attribute="data-theme"` so the active theme lands on `<html>` as the
 *   `data-theme="light" | "dark"` attribute our CSS already keys off.
 * - `defaultTheme="system"` + `enableSystem` resolves to the OS preference
 *   on first load when no explicit choice is stored.
 * - `disableTransitionOnChange` suppresses CSS transitions during the swap so
 *   the theme flip is instant rather than animating every coloured surface.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="workbench-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
