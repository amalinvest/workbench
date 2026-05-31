import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { SiteChrome } from "@/components/site-chrome";
import { source } from "@/lib/docs/source";
import { baseOptions } from "@/lib/layout.shared";

export default function DocsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteChrome section="docs" active="docs">
      <DocsLayout
        tree={source.getPageTree()}
        {...baseOptions()}
        sidebar={{
          className:
            "border-[color:var(--color-border)]/60 bg-[color:var(--color-background)]",
        }}
      >
        {children}
      </DocsLayout>
    </SiteChrome>
  );
}
