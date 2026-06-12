type OgTemplateProps = {
  kicker: string;
  title: string;
  description: string;
  badge: string;
  footerLeft: string;
  footerRight: string;
};

export const ogImageSize = {
  width: 1200,
  height: 630
};

export function OgTemplate({ kicker, title, description, badge, footerLeft, footerRight }: OgTemplateProps) {
  const titleSize = title.length > 76 ? 54 : title.length > 54 ? 64 : 78;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "#17201d",
        color: "#fbfcf7",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: 30,
            fontWeight: 800
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 68,
              borderRadius: 8,
              background: "#0f766e",
              color: "#ffffff"
            }}
          >
            7
          </span>
          <span>7labs.org</span>
        </div>
        <div
          style={{
            border: "1px solid rgba(255,255,255,.28)",
            borderRadius: 8,
            padding: "12px 18px",
            color: "#b7d9d4",
            fontSize: 24,
            fontWeight: 700
          }}
        >
          {badge}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <div style={{ color: "#8fd3c9", fontSize: 28, fontWeight: 800, textTransform: "uppercase" }}>
          {kicker}
        </div>
        <div style={{ fontSize: titleSize, lineHeight: 1.02, fontWeight: 900, maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.35, color: "#d7ded9", maxWidth: 940 }}>
          {description}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", color: "#b7c4bd", fontSize: 24 }}>
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>
    </div>
  );
}
