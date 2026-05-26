import { ImageResponse } from "next/og";
import { getPost, listPostSlugs } from "../../../lib/blog/posts";

export const alt = "Workbench — the missing dashboard for BullMQ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Pre-render every post's OG image at build time. Next.js requires its own
 * `generateStaticParams` on the image route — it doesn't inherit the parent
 * page's static params automatically. Without this each OG image would be
 * server-rendered on demand the first time a link-unfurl bot fetched it.
 */
export function generateStaticParams() {
  return listPostSlugs().map((slug) => ({ slug }));
}

/**
 * Dynamic Open Graph image for each blog post.
 *
 * For framework announcements the canvas renders a "Workbench × {framework}"
 * lockup matching the in-page hero, so what people see in their Twitter
 * timeline matches what they get when they click through. For the bull-board
 * comparison post (no framework) we render a simpler "Workbench" mark in
 * the same slot.
 *
 * ImageResponse uses Satori under the hood, which supports a subset of CSS
 * and renders inline SVG verbatim — that's why we can drop the framework
 * Logo component straight into JSX and have it Just Work.
 */
export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return new ImageResponse(<div>Not found</div>, size);
  }

  const accent = "#2f6cff";
  const bg = "#0a0a0a";
  const fg = "#fafafa";
  const muted = "#a3a3a3";
  const border = "#262626";

  const Logo = post.framework?.Logo;
  // Slug-driven branch for posts that aren't tied to a framework but
  // still want a "W × X" lockup in the OG image. Today this is just the
  // MCP launch post; if we add more standalone posts (e.g. a future Hyper
  // post that needs its own mark) we can extend this lookup rather than
  // forcing them through the `framework` shape.
  const isMcpPost = slug === "bullmq-mcp-server";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: bg,
        color: fg,
        padding: "72px 80px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            background: accent,
            borderRadius: 12,
            color: "white",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          W
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: -0.3,
            color: fg,
          }}
        >
          workbench
        </div>
        <div
          style={{
            marginLeft: 16,
            padding: "6px 12px",
            borderRadius: 6,
            border: `1px solid ${border}`,
            color: muted,
            fontSize: 14,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          {post.eyebrow}
        </div>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}
      >
        {(Logo || isMcpPost) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              marginBottom: 36,
            }}
          >
            <Tile>
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: accent,
                  letterSpacing: -2,
                }}
              >
                W
              </span>
            </Tile>
            <span
              style={{
                fontSize: 40,
                color: muted,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              ×
            </span>
            <Tile>
              {Logo ? (
                <Logo width={72} height={72} style={{ color: fg }} />
              ) : (
                // MCP wordmark — kept inline so we don't drag a new logo
                // file in for a single use site. The protocol doesn't have
                // a widely-recognised glyph; the literal letters are the
                // most legible thing at OG-thumbnail scale.
                <span
                  style={{
                    fontSize: 44,
                    fontWeight: 700,
                    color: fg,
                    letterSpacing: -1.5,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  MCP
                </span>
              )}
            </Tile>
          </div>
        )}

        {isMcpPost && (
          <div
            style={{
              marginBottom: 24,
              fontSize: 16,
              color: muted,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Model Context Protocol server
          </div>
        )}

        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            maxWidth: 1000,
          }}
        >
          {post.heading}
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 24,
            color: muted,
            lineHeight: 1.45,
            maxWidth: 900,
          }}
        >
          {truncate(post.lede, 160)}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 48,
          paddingTop: 24,
          borderTop: `1px solid ${border}`,
          color: muted,
          fontSize: 18,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        <span>getworkbench.dev/blog</span>
        <span>{new Date(post.publishedAt).getFullYear()}</span>
      </div>
    </div>,
    size,
  );
}

function Tile({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 128,
        height: 128,
        borderRadius: 24,
        background: "#141414",
        border: "1px solid #262626",
      }}
    >
      {children}
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}
