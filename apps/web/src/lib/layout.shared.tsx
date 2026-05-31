import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { DocsNavTitle } from "@/components/docs/docs-nav-title";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { enabled: false },
    themeSwitch: { enabled: false },
    githubUrl: "https://github.com/pontusab/workbench",
    slots: {
      navTitle: DocsNavTitle,
    },
  };
}
