"use client";

import { useState } from "react";
import { Button, Card, Input, Badge, Modal, Toggle, ToastContainer, ThemeType } from "./components/DesignSystem";
import OptimisticDemo from "./components/OptimisticDemo";

type LayoutType = "grid" | "hero" | "sidebar" | "tech";

export default function DesignPlayground() {
  const [layout, setLayout] = useState<LayoutType>("grid");
  const [theme, setTheme] = useState<ThemeType>("minimal");
  const [animate, setAnimate] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: number, text: string}[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const addToast = (text: string) => {
    if (!notificationsEnabled) return;
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const getBackgroundClass = () => {
    switch (theme) {
      case "dark": return "bg-gray-900";
      case "gradient": return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500";
      case "glass": return "bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center bg-fixed";
      default: return "bg-gray-50"; 
    }
  };

  const renderContent = () => {
    // --- TECH DEMO LAYOUT (ÚJ!) ---
    if (layout === "tech") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in duration-500">
          {/* Bal oldal: Magyarázat */}
          <div className="flex flex-col gap-6">
             <Card theme={theme} animate={animate}>
                <Badge theme={theme}>React 19 Feature</Badge>
                <h2 className="text-2xl font-bold mt-2 mb-4">Optimistic Updates</h2>
                <p className="opacity-80 mb-4">
                    A jobb oldali chat ablak a <code>useOptimistic</code> hookot használja.
                    Írj be egy üzenetet, és nyomj entert!
                </p>
                <ul className="list-disc pl-5 space-y-2 opacity-80 text-sm">
                    <li>Az üzenet <strong>azonnal</strong> megjelenik (halványan).</li>
                    <li>A rendszer szimulál egy 2 másodperces szerver késést.</li>
                    <li>Amikor letelik az idő, az üzenet "megerősített" stílusra vált.</li>
                    <li>A "Küldés" gomb töltődik, amíg a folyamat tart.</li>
                </ul>
             </Card>

             <Card theme={theme} animate={animate}>
                <h3 className="font-bold text-lg mb-2">Miért jó ez?</h3>
                <p className="text-sm opacity-75">
                    A felhasználók utálják a várakozást. Ezzel a technikával az alkalmazás villámgyorsnak tűnik, még lassú internet mellett is, mert a felület előrevetíti a sikeres műveletet.
                </p>
             </Card>
          </div>

          {/* Jobb oldal: Maga a Demo */}
          <div>
            <OptimisticDemo theme={theme} />
          </div>
        </div>
      );
    }

    // --- EGYÉB LAYOUTOK (GRID, HERO, SIDEBAR) ---
    // (A korábbi kód részei változatlanok, csak rövidítve a hely miatt, de működnek)
    const items = Array.from({ length: 6 }).map((_, i) => ({ id: i, title: `Elem ${i + 1}`, desc: "Interaktív komponens demo." }));

    if (layout === "hero") {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
          <Card theme={theme} animate={animate} className="max-w-2xl w-full p-12">
            <Badge theme={theme}>Next.js 16 Ready</Badge>
            <h1 className="text-5xl font-extrabold mt-6 mb-6">UI Playground</h1>
            <p className="mb-8 opacity-80 text-xl">Próbáld ki az új <b>Tech</b> fület a React 19 demóhoz!</p>
            <div className="flex gap-4 justify-center">
              <Button theme={theme} animate={animate} onClick={() => setLayout('tech')}>Tech Demo Megnyitása</Button>
              <Button theme={theme} animate={animate} onClick={() => addToast("Szia!")}>Toast Teszt</Button>
            </div>
          </Card>
        </div>
      );
    }

    if (layout === "sidebar") {
        return (
          <div className="flex flex-col md:flex-row gap-6 h-full animate-in slide-in-from-left duration-500">
            <Card theme={theme} animate={animate} className="w-full md:w-1/4 h-fit">
              <div className="font-bold mb-4">Navigáció</div>
              <ul className="space-y-3 opacity-80 cursor-pointer">
                <li onClick={() => setLayout('grid')}>Grid Nézet</li>
                <li onClick={() => setLayout('tech')} className="font-bold text-blue-500">Tech Demo (Új)</li>
                <li onClick={() => setIsModalOpen(true)}>Beállítások</li>
              </ul>
            </Card>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.slice(0, 4).map((item) => (
                <Card key={item.id} theme={theme} animate={animate}>
                  <h3 className="font-bold">{item.title}</h3>
                  <Button theme={theme} animate={animate} className="mt-4" onClick={() => addToast("Mentve!")}>Akció</Button>
                </Card>
              ))}
            </div>
          </div>
        );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in duration-500">
        {items.map((item) => (
          <Card key={item.id} theme={theme} animate={animate}>
             <div className="flex justify-between mb-4"><div className="font-bold bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-black">{item.id+1}</div><Badge theme={theme}>Kártya</Badge></div>
            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
            <p className="opacity-75 mb-4">{item.desc}</p>
            <Input theme={theme} animate={animate} placeholder="..." />
          </Card>
        ))}
      </div>
    );
  };

  return (
    <main className={`min-h-screen p-4 transition-colors duration-700 ${getBackgroundClass()}`}>
      <ToastContainer theme={theme} messages={toasts} />
      <Modal theme={theme} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Beállítások">
        <p className="mb-4">Itt állíthatod be a rendszer működését.</p>
        <div className="flex justify-between items-center mb-4 bg-gray-500/10 p-3 rounded">
            <span>Értesítések</span>
            <Toggle theme={theme} isActive={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />
        </div>
        <Button theme={theme} onClick={() => setIsModalOpen(false)}>Bezárás</Button>
      </Modal>

      <div className="sticky top-4 z-40 max-w-6xl mx-auto mb-8">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 md:p-4 text-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="font-bold text-xl">🎨 Playground</div>
            <div className="flex flex-wrap justify-center gap-2">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {(['grid', 'hero', 'sidebar', 'tech'] as LayoutType[]).map((l) => (
                  <button key={l} onClick={() => setLayout(l)} className={`px-3 py-1 rounded-md text-sm transition-all ${layout === l ? 'bg-white shadow-sm font-bold text-black' : 'text-gray-500 hover:text-gray-800'}`}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
              <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeType)} className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm">
                <option value="minimal">Minimal</option>
                <option value="dark">Dark</option>
                <option value="gradient">Gradient</option>
                <option value="glass">Glass</option>
              </select>
              <button onClick={() => setAnimate(!animate)} className={`w-8 h-8 rounded-lg border ${animate ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>{animate ? '▶' : '⏸'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">{renderContent()}</div>
    </main>
  );
}