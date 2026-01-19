"use client";

import { useState } from "react";
import { Button, Card, Input, Badge } from "./components/DesignSystem";

// --- Típus definíciók ---
type LayoutType = "grid" | "hero" | "sidebar" | "list";
type ThemeType = "minimal" | "dark" | "gradient" | "glass";

export default function DesignPlayground() {
  // --- STATE (Állapotok) ---
  const [layout, setLayout] = useState<LayoutType>("grid");
  const [theme, setTheme] = useState<ThemeType>("minimal");
  const [animate, setAnimate] = useState<boolean>(true);

  // --- Háttér beállítása a téma alapján ---
  const getBackgroundClass = () => {
    switch (theme) {
      case "dark": return "bg-gray-900";
      case "gradient": return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500";
      case "glass": return "bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center";
      default: return "bg-gray-50"; // Minimal
    }
  };

  // --- Layout Renderelő Logika ---
  const renderContent = () => {
    // Adatgenerálás (Dummy data)
    const items = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      title: `Project ${i + 1}`,
      desc: "Ez egy minta komponens a React state bemutatására.",
    }));

    if (layout === "hero") {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Card theme={theme} animate={animate} className="max-w-2xl w-full p-12">
            <Badge theme={theme}>Kiemelt</Badge>
            <h1 className={`text-4xl font-bold mt-4 mb-6 ${theme === 'minimal' ? 'text-gray-900' : 'text-inherit'}`}>
              Design Rendszer Playground
            </h1>
            <p className="mb-8 opacity-80 text-lg">
              Próbáld ki hogyan változik az UI szerkezete és stílusa egyetlen kattintással.
            </p>
            <div className="flex gap-4 justify-center">
              <Button theme={theme} animate={animate}>Kezdés</Button>
              <Button theme={theme} animate={animate} onClick={() => alert("Másodlagos akció!")}>További infó</Button>
            </div>
          </Card>
        </div>
      );
    }

    if (layout === "sidebar") {
      return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <Card theme={theme} animate={animate} className="w-full md:w-1/4 h-auto md:h-96">
            <h3 className="font-bold text-xl mb-4">Navigáció</h3>
            <ul className="space-y-2 opacity-80">
              <li>Dashboard</li>
              <li>Beállítások</li>
              <li>Profil</li>
              <li>Kijelentkezés</li>
            </ul>
          </Card>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.slice(0, 4).map((item) => (
              <Card key={item.id} theme={theme} animate={animate}>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="opacity-70 text-sm mt-2">{item.desc}</p>
                <div className="mt-4">
                  <Button theme={theme} animate={animate}>Megtekintés</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // Default: Grid Layout
    return (
      <div className={`grid gap-6 ${layout === 'list' ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {items.map((item) => (
          <Card key={item.id} theme={theme} animate={animate}>
             <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold 
                  ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100 text-gray-600'}`}>
                  {item.id + 1}
                </div>
                <Badge theme={theme}>Aktív</Badge>
             </div>
            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
            <p className="opacity-75 mb-4">{item.desc}</p>
            <Input theme={theme} animate={animate} placeholder="Írj megjegyzést..." />
            <div className="mt-4 flex justify-end">
               <Button theme={theme} animate={animate}>Részletek</Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <main className={`min-h-screen p-4 transition-colors duration-700 ${getBackgroundClass()}`}>
      
      {/* --- VEZÉRLŐPULT (Fixed Top) --- */}
      <div className="sticky top-4 z-50 max-w-5xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-4 text-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Logo / Cím */}
            <div className="font-bold text-xl">🎨 UI Playground</div>

            {/* Layout Választó */}
            <div className="flex gap-2 text-sm overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <span className="self-center font-semibold mr-2 hidden md:block">Layout:</span>
              {(['grid', 'list', 'hero', 'sidebar'] as LayoutType[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className={`px-3 py-1 rounded-md transition-colors ${layout === l ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>

            {/* Téma Választó */}
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as ThemeType)}
              className="px-3 py-1 rounded-md border border-gray-300 bg-white"
            >
              <option value="minimal">Minimal Theme</option>
              <option value="dark">Dark Mode</option>
              <option value="gradient">Gradient Pop</option>
              <option value="glass">Glassmorphism</option>
            </select>

            {/* Animáció Toggle */}
            <button
              onClick={() => setAnimate(!animate)}
              className={`px-3 py-1 rounded-md border text-sm font-semibold ${animate ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}
            >
              Anim: {animate ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* --- TARTALOM --- */}
      <div className={`max-w-6xl mx-auto transition-opacity duration-500 ${animate ? 'opacity-100' : 'opacity-100'}`}>
        {renderContent()}
      </div>

    </main>
  );
}