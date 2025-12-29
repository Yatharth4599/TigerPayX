import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon - Using SVG for modern browsers, with ICO fallback */}
        <link rel="icon" href="/assets/logo.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/assets/logo.svg" />
        
        {/* Primary Meta Tags */}
        <meta name="title" content="TigerPayX - The Stablecoin Neobank" />
        <meta
          name="description"
          content="The stablecoin neobank that makes borders disappear. Global payments with ultra-low fees. Pay with stablecoins at any QR code without bank freeze worries."
        />
        <meta name="keywords" content="stablecoin, neobank, global payments, crypto payments, USDC, borderless payments, TigerPayX" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="TigerPayX" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tigerpayx.com/" />
        <meta property="og:title" content="TigerPayX - The Stablecoin Neobank" />
        <meta
          property="og:description"
          content="The stablecoin neobank that makes borders disappear. Global payments with ultra-low fees. Pay with stablecoins at any QR code without bank freeze worries."
        />
        <meta property="og:image" content="https://tigerpayx.com/assets/logo.svg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://tigerpayx.com/" />
        <meta property="twitter:title" content="TigerPayX - The Stablecoin Neobank" />
        <meta
          property="twitter:description"
          content="The stablecoin neobank that makes borders disappear. Global payments with ultra-low fees. Pay with stablecoins at any QR code without bank freeze worries."
        />
        <meta property="twitter:image" content="https://tigerpayx.com/assets/logo.svg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
