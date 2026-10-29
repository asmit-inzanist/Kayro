import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nourish • Clinical Nutrition Consultation",
  description: "Personalized clinical nutrition and metabolic health care with Dr. Anika Mehta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fraunces.variable} ${plusJakartaSans.variable} ${inter.variable} min-h-screen bg-[#1C1C1E] text-[#F5F2EC] selection:bg-[#F4694C] selection:text-white antialiased`}
      >
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
