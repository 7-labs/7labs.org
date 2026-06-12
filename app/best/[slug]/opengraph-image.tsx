import { ImageResponse } from "next/og";
import { bestPages, getBestPage } from "@/lib/bestPages";
import { OgTemplate, ogImageSize } from "@/lib/ogTemplate";

export const alt = "7labs.org best AI guide preview";
export const size = ogImageSize;
export const contentType = "image/png";

type BestOgImageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return bestPages.map((page) => ({ slug: page.slug }));
}

export default async function BestOgImage({ params }: BestOgImageProps) {
  const { slug } = await params;
  const page = getBestPage(slug) ?? bestPages[0];

  return new ImageResponse(
    (
      <OgTemplate
        kicker="Best AI Guide"
        title={page.title}
        description={page.description}
        badge="Task-first ranking"
        footerLeft="Workflow before purchase"
        footerRight={`Reviewed ${page.lastReviewed}`}
      />
    ),
    size
  );
}
