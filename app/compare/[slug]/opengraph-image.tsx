import { ImageResponse } from "next/og";
import { comparePages, getComparePage } from "@/lib/comparePages";
import { OgTemplate, ogImageSize } from "@/lib/ogTemplate";

export const alt = "7labs.org AI comparison preview";
export const size = ogImageSize;
export const contentType = "image/png";

type CompareOgImageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return comparePages.map((page) => ({ slug: page.slug }));
}

export default async function CompareOgImage({ params }: CompareOgImageProps) {
  const { slug } = await params;
  const page = getComparePage(slug) ?? comparePages[0];

  return new ImageResponse(
    (
      <OgTemplate
        kicker="AI Tool Comparison"
        title={page.title}
        description={page.description}
        badge={`${page.left} vs ${page.right}`}
        footerLeft="Decision support"
        footerRight={`Reviewed ${page.lastReviewed}`}
      />
    ),
    size
  );
}
