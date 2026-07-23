import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// الخطوط
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "عيادة الدكتور أنور - جراحة العظام والمفاصل",
    template: "%s | عيادة الدكتور أنور",
  },
  description:
    "عيادة الدكتور أنور لجراحة العظام والمفاصل - تقديم رعاية متخصصة في علاج الكسور، آلام المفاصل، العمود الفقري، والطب الرياضي بأحدث التقنيات.",
  keywords: [
    "دكتور أنور",
    "جراحة عظام",
    "عيادة عظام",
    "علاج المفاصل",
    "كسور",
    "عمود فقري",
    "طب رياضي",
    "عيادة عظام في مصر",
  ],
  authors: [{ name: "دكتور أنور" }],
  openGraph: {
    title: "عيادة الدكتور أنور - جراحة العظام والمفاصل",
    description:
      "عيادة متخصصة في جراحة العظام والمفاصل - خبرة في علاج الكسور، آلام الظهر، والطب الرياضي.",
    type: "website",
    locale: "ar_EG",
    url: "https://orthopedic-clinic-dr-anwar.vercel.app",
    siteName: "عيادة الدكتور أنور",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "عيادة الدكتور أنور",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "عيادة الدكتور أنور - جراحة العظام والمفاصل",
    description:
      "رعاية متخصصة في جراحة العظام والمفاصل - خبرة في العلاج الطبيعي والطب الرياضي.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification", // استبدل برمز التحقق الخاص بك
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // يمكن إضافة دعم ديناميكي للغة RTL من خلال الـ Providers
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cairo.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-gray-50">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
