import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    // Plain <pre><code> fences — rendered by our DocsCodeBlock via the pre MDX override.
    rehypeCodeOptions: false,
  },
});
