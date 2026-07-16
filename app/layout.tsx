import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://revenue-operations-command-center.vercel.app",
  ),
  title: {
    default: "Revenue Operations Command Center | Yasser Ramirez",
    template: "%s | Revenue Operations Command Center",
  },
  description:
    "Interactive portfolio project demonstrating CRM architecture, revenue operations, automation, analytics and business intelligence using synthetic data.",
  applicationName: "Revenue Operations Command Center",
  authors: [{ name: "Yasser Ramirez" }],
  creator: "Yasser Ramirez",
  openGraph: {
    title: "Revenue Operations Command Center | Yasser Ramirez",
    description:
      "Interactive CRM, automation, analytics and revenue operations portfolio project.",
    url: "/overview",
    siteName: "Revenue Operations Command Center",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Revenue Operations Command Center | Yasser Ramirez",
    description:
      "Interactive CRM, automation, analytics and revenue operations portfolio project.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
