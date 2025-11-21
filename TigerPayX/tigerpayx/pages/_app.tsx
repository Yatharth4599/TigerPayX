import type { AppProps } from "next/app";
import "@/app/globals.css";
import "@/app/styles.css";
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
    <div className={`${poppins.variable} font-sans`}>
      <Component {...pageProps} />
      <ToastContainer />
    </div>
  );
}


