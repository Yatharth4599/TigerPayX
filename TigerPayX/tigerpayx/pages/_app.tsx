import type { AppProps } from "next/app";
import Head from "next/head";
import "@/app/globals.css";
import { Poppins } from "next/font/google";
import { ToastContainer } from "@/components/Toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export default function TigerPayXApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </Head>
      <div className={`${poppins.variable} font-sans overflow-x-hidden`}>
      <Component {...pageProps} />
      <ToastContainer />
    </div>
    </>
  );
}


