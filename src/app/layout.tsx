import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileNav } from "@/components/MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FindBack — 분실물을 안전하게 찾아드려요",
  description:
    "QR 키링으로 분실물을 더 안전하고 빠르게 돌려받으세요. 개인정보 공개 없이 습득자가 바로 제보할 수 있습니다.",
};

// Runs before first paint so the saved (or system) theme never flashes.
const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("fb-theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-ink">
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
