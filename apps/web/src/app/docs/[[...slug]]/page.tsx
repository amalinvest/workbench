import type { TableOfContents } from "fumadocs-core/toc";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { getMDXComponents } from "@/components/mdx";
import { source } from "@/lib/docs/source";

const SITE_URL = "https://getworkbench.dev";

interface DocsPageData {
  title: string;
  description?: string;
  keywords?: string[];
  body: ComponentType<{ components?: MDXComponents }>;
  toc: TableOfContents;
  full?: boolean;
}

interface RouteParams {
  params: Promise<{ slug?: string[] }>;
}

function docPath(slug?: string[]) {
  return slug?.length ? `/docs/${slug.join("/")}` : "/docs";
}

function breadcrumbJsonLd(slug?: string[], title?: string) {
  const items = [
    { name: "Home", item: SITE_URL },
    { name: "Docs", item: `${SITE_URL}/docs` },
  ];

  if (slug?.length) {
    let path = "/docs";
    for (const segment of slug) {
      path += `/${segment}`;
      items.push({
        name: segment.replace(/-/g, " "),
        item: `${SITE_URL}${path}`,
      });
    }
    if (title && items.length > 0) {
      items[items.length - 1].name = title;
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function articleJsonLd(
  slug: string[] | undefined,
  title: string,
  description: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url: `${SITE_URL}${docPath(slug)}`,
    author: {
      "@type": "Person",
      name: "Pontus Abrahamsson",
      url: "https://x.com/pontusab",
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  };
}

export default async function DocsPageRoute({ params }: RouteParams) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const data = page.data as DocsPageData;
  const MDX = data.body;
  const title = data.title;
  const description = data.description ?? "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(slug, title)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(slug, title, description)),
        }}
      />
      <DocsPage toc={data.toc} full={data.full}>
        <DocsTitle>{title}</DocsTitle>
        <DocsDescription>{description}</DocsDescription>
        <DocsBody>
          <MDX
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    </>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const data = page.data as DocsPageData;
  const keywords = data.keywords;

  return {
    title: `${data.title} — Workbench Docs`,
    description: data.description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: docPath(slug) },
    openGraph: {
      title: data.title,
      description: data.description,
      url: docPath(slug),
      type: "article",
      siteName: "Workbench",
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      creator: "@pontusab",
      images: ["/og.png"],
    },
  };
}
