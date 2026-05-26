import type { MetadataRoute } from "next";

/**
 * Robots policy.
 *
 * The default `User-agent: *` `Allow: /` covers every well-behaved crawler,
 * including Googlebot and Bingbot — so by themselves AI search engines that
 * follow standard robots.txt (ChatGPT, Perplexity, Claude, Gemini) would
 * already be allowed.
 *
 * We list them explicitly anyway because:
 *   1. AI bots are the audience we're actively courting — being cited in
 *      ChatGPT / Perplexity / Claude / Gemini answers drives high-intent
 *      traffic. Explicit `Allow` rules make that policy visible and
 *      reviewable, instead of resting on the default.
 *   2. Some CDN / WAF setups (Cloudflare's "Block AI Bots", etc.) enforce
 *      blocks at the edge that override the default. Naming each bot here
 *      makes it obvious to anyone reading the file what the site's stance is.
 *   3. The list is the standard, audited set of "search + cite" bots
 *      documented by each AI vendor — sources cite their per-vendor docs
 *      (OpenAI/GPTBot, Perplexity/PerplexityBot, Anthropic/ClaudeBot,
 *      Google/Google-Extended, Microsoft/Bingbot).
 *
 * We *do* block `CCBot` (Common Crawl). CCBot is used purely for training-
 * dataset collection — blocking it does not affect AI search citation, but
 * does opt us out of bulk LLM training corpora that are downstream of Common
 * Crawl. Different trade-off, different bot.
 */
const AI_SEARCH_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "Google-Extended",
  "Bingbot",
  "Applebot-Extended",
];

const TRAINING_ONLY_BOTS = ["CCBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
      ...TRAINING_ONLY_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: "https://getworkbench.dev/sitemap.xml",
    host: "https://getworkbench.dev",
  };
}
