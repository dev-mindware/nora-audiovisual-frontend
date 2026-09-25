import type { Metadata } from "next";
import "driver.js/dist/driver.css";
import "./globals.css";
import { ReactQueryProvider } from "@/lib";
import {
  Inter,
  Outfit,
  Roboto,
  Poppins,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { ThemeProvider } from "@/providers";
import { CustomToaster } from "@/utils";
import { SidebarProvider } from "@/components";
import { AuthProvider } from "@/contexts";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { PwaServiceWorkerRegister } from "@/components/shared/pwa-service-worker-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "Nora Audiovisual | Gestão e Produção Audiovisual",
    template: "%s | Nora Audiovisual",
  },
  description:
    "Plataforma completa de gestão audiovisual: equipamentos, reservas, alugueres, produção técnica e recursos operacionais.",
  applicationName: "Nora Audiovisual",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-AO"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${roboto.variable} ${poppins.variable} ${plusJakartaSans.variable}`}
    >
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-family, var(--font-inter), sans-serif)" }}
      >
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          themes={["light", "dark", "system"]}
          storageKey="nora-theme"
        >
          <ReactQueryProvider>
            <AuthProvider>
              <NuqsAdapter>
                <PwaServiceWorkerRegister />
                <SidebarProvider>{children}</SidebarProvider>
                <CustomToaster />
              </NuqsAdapter>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
