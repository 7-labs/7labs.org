import { ImageResponse } from "next/og";
import { categories, getTool, tools } from "@/lib/tools";
import { OgTemplate, ogImageSize } from "@/lib/ogTemplate";

export const alt = "7labs.org AI tool preview";
export const size = ogImageSize;
export const contentType = "image/png";

type ToolOgImageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolOgImage({ params }: ToolOgImageProps) {
  const { slug } = await params;
  const tool = getTool(slug) ?? tools[0];
  const category = categories[tool.category];

  return new ImageResponse(
    (
      <OgTemplate
        kicker="Free Online AI Tool"
        title={tool.name}
        description={tool.description}
        badge={category.name}
        footerLeft="Local rules by default"
        footerRight={`Reviewed ${tool.lastReviewed}`}
      />
    ),
    size
  );
}
