import type { AppProps } from "next/app";
import "@/app/globals.css";
import { Poppins } from "next/font/google";
import { ToastContainer } from "@/components/Toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export default function TigerPayXApp({ Component, pageProps }: AppProps) {
  return (
    <div className={poppins.variable}>
      <Component {...pageProps} />
      <ToastContainer />
    </div>
  );
}


