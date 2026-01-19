"use client";

import { useState } from "react";
import { Button, Card, Input, Badge, Modal, Toggle, ToastContainer, ThemeType, Tooltip } from "./components/DesignSystem";
import OptimisticDemo from "./components/OptimisticDemo";
import DataFetchDemo from "./components/DataFetchDemo";

type LayoutType = "grid" | "hero" | "sidebar" | "tech" | "animations" | "data";

export default function DesignPlayground() {
  const [layout, setLayout] = useState<LayoutType>("data"); // Most a Data legyen az alapértelmezett
  const [theme, setTheme] = useState<ThemeType>("minimal");
  const [animate, setAnimate] = useState<boolean>(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: number, text: string}[]>([]);
  const [shake, setShake] = useState(false);

  const addToast = (text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
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
    if (layout === "data") return <DataFetchDemo theme={theme} />;
    if (layout === "tech") return <OptimisticDemo theme={theme} />;
    
    // --- ANIMATIONS ---
    if (layout === "animations") {
      return (
        <div className="space-y-12 pb-20">
            <section>
                <div className="mb-6 border-b border-gray-400/20 pb-2"><h2 className={`text-2xl font-bold ${theme === 'minimal' ? 'text-gray-900' : 'text-inherit'}`}>Lépcsőzetes Megjelenés</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="animate-in slide-in-from-bottom-10 fade-in duration-700 fill-mode-both" style={{ animationDelay: `${i * 150}ms` }}>
                            <Tooltip theme={theme} text={`Ez a kártya ${i * 150}ms késleltetéssel jelenik meg.`}><Card theme={theme} animate={animate}><h3 className="font-bold text-lg">Kártya {i + 1}</h3></Card></Tooltip>
                        </div>
                    ))}
                </div>
            </section>
            <section>
                <div className="mb-6 border-b border-gray-400/20 pb-2"><h2 className={`text-2xl font-bold ${theme === 'minimal' ? 'text-gray-900' : 'text-inherit'}`}>Effektek</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card theme={theme} animate={false}><div className="flex items-center gap-4"><div className="relative flex h-6 w-6"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-6 w-6 bg-red-500"></span></div><h3 className="font-bold">Ping</h3></div></Card>
                    <Card theme={theme} animate={false}><div className="flex items-center gap-4"><Input theme={theme} animate={false} placeholder="Shake Demo" className={shake ? "animate-shake border-red-500" : ""} /><Button theme={theme} animate={animate} onClick={triggerShake}>Rázd meg</Button></div></Card>
                </div>
            </section>
        </div>
      );
    }

    // --- FALLBACK (GRID/HERO/SIDEBAR) ---
    const items = Array.from({ length: 6 }).map((_, i) => ({ id: i, title: `Projekt ${i + 1}`, desc: "Demo tartalom" }));
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in duration-500">
        {items.map((item) => (
          <Card key={item.id} theme={theme} animate={animate}>
             <h3 className="font-bold">{item.title}</h3>
             <p className="opacity-75">{item.desc}</p>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <main className={`min-h-screen p-4 transition-colors duration-700 ${getBackgroundClass()}`}>
      <ToastContainer theme={theme} messages={toasts} />
      <Modal theme={theme} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Info"><p>Ez a modal.</p></Modal>

      <div className="sticky top-4 z-40 max-w-6xl mx-auto mb-8">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 md:p-4 text-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="font-bold text-xl">🎨 UI Labs</div>
            <div className="flex flex-wrap justify-center gap-2">
              <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                {(['data', 'animations', 'tech', 'grid', 'hero'] as LayoutType[]).map((l) => (
                  <button key={l} onClick={() => setLayout(l)} className={`px-3 py-1 rounded-md text-sm whitespace-nowrap transition-all ${layout === l ? 'bg-white shadow-sm font-bold text-black' : 'text-gray-500 hover:text-gray-800'}`}>
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">{renderContent()}</div>
    </main>
  );
}