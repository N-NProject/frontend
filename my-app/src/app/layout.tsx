import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import ReactQueryProviders from "@/utils/react-query-provider";
import WebNavBar from "@/components/navweb";
import MobileNavBar from "@/components/nav";
import Sidebar from "@/components/Sidebar";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "요기조기",
  description: "모두모여! 요기조기!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://developers.kakao.com/sdk/js/kakao.min.js"></script>
      </head>
      <body className="flex md:flex-row flex-col">
        <Script
          async
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.3.0/kakao.min.js"
          integrity="sha384-70k0rrouSYPWJt7q9rSTKpiTfX6USlMYjZUtr1Du+9o4cGvhPAWxngdtVZDdErlh"
          crossOrigin="anonymous"
        ></Script>
        <div className="h-1/6">
          <WebNavBar />
        </div>
        <main className="w-full h-4/6">
          <ReactQueryProviders>{children}</ReactQueryProviders>
        </main>
        <div className="h-1/6">
          <MobileNavBar />
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/datepicker.min.js"></script>
      </body>
    </html>
  );
}
