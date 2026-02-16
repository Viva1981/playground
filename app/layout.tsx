import Header from "@/app/components/Header";
import ScrollToTop from "@/app/components/ScrollToTop";
import { getHomeHero } from "@/app/lib/getHomeHero";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hero = await getHomeHero();
  const heroSettings = hero?.settings || null;
  const heroContentColor = heroSettings?.content_color || null;
  const heroPrimaryTextColor = heroSettings?.primary_button_text_color || "#ffffff";

  return (
    <html lang="hu" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
        <ScrollToTop
          backgroundColor={heroContentColor}
          textColor={heroPrimaryTextColor}
        />
      </body>
    </html>
  );
}
