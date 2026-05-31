import type { ReactNode } from "react";
import { SiteChrome } from "../site-chrome";

interface BlogChromeProps {
  children: ReactNode;
}

/**
 * Shared header + footer used by both the blog index and individual post
 * pages. Delegates to SiteChrome with blog section styling.
 */
export function BlogChrome({ children }: BlogChromeProps) {
  return (
    <SiteChrome section="blog" active="blog">
      {children}
    </SiteChrome>
  );
}
