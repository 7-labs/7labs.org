import { ImageResponse } from "next/og";
import { getPromptPage, promptPages } from "@/lib/promptPages";
import { OgTemplate, ogImageSize } from "@/lib/ogTemplate";

export const alt = "7labs.org prompt library preview";
export const size = ogImageSize;
export const contentType = "image/png";

type PromptOgImageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return promptPages.map((page) => ({ slug: page.slug }));
}

export default async function PromptOgImage({ params }: PromptOgImageProps) {
  const { slug } = await params;
  const page = getPromptPage(slug) ?? promptPages[0];

  return new ImageResponse(
    (
      <OgTemplate
        kicker="Copy-Ready Prompts"
        title={page.title}
        description={page.metaDescription}
        badge="Prompt Library"
        footerLeft={`${page.examples.length} examples`}
        footerRight={`Reviewed ${page.lastReviewed}`}
      />
    ),
    size
  );
}
