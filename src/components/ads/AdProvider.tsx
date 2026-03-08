import Script from "next/script";

interface Props {
  publisherId?: string;
}

export default function AdProvider({ publisherId = "ca-pub-XXXXXXXXXXXXXXXX" }: Props) {
  if (publisherId === "ca-pub-XXXXXXXXXXXXXXXX") {
    // AdSense not configured yet — skip loading script
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
