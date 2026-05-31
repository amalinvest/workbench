import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { HTMLAttributes } from "react";
import { DocsCodeBlock } from "./docs/docs-code-block";
import { CopyCommand } from "./copy-command";
import { FrameworkGrid } from "./docs/framework-grid";
import { detectLanguage, extractText } from "@/lib/docs/extract-code";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    pre: (props: HTMLAttributes<HTMLPreElement>) => {
      const code = extractText(props.children).replace(/\n$/, "");
      if (!code.trim()) {
        return <pre {...props} />;
      }
      const language = detectLanguage(props.className, props.children);
      return <DocsCodeBlock code={code} language={language} />;
    },
    CopyCommand,
    FrameworkGrid,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
