"use client";

import { useState } from "react";
import { Button, Card, Input, Badge, Modal, Toggle, ToastContainer, ThemeType, Tooltip } from "./components/DesignSystem";
import OptimisticDemo from "./components/OptimisticDemo";

type LayoutType = "grid" | "hero" | "sidebar" | "tech" | "animations";

export default function DesignPlayground() {
  const [layout, setLayout] = useState<LayoutType>("animations"); // Default legyen most az animations
  const [theme, setTheme] = useState<ThemeType>("minimal");
  const [animate, setAnimate] = useState<boolean>(true);
  
  // State-ek
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: number, text: string}[]>([]);
  const [shake, setShake] = useState(false); // Rázkódás állapota

  const addToast = (text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500); // 500ms után leállítjuk
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
    // --- ANIMATIONS LAYOUT (ÚJ!) ---
    if (layout === "animations") {
      return (
        <div className="space-y-12 pb-20">
            
            {/* 1. SECTION: STAGGERED ENTRANCE */}
            <section>
                <div className="mb-6 border-b border-gray-400/20 pb-2">
                    <h2 className={`text-2xl font-bold ${theme === 'minimal' ? 'text-gray-900' : 'text-inherit'}`}>1. Lépcsőzetes Megjelenés (Staggered)</h2>
                    <p className="opacity-70 text-sm">Frissítsd az oldalt vagy válts témát, hogy újra lásd!</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="animate-in slide-in-from-bottom-10 fade-in duration-700 fill-mode-both" style={{ animationDelay: `${i * 150}ms` }}>
                            <Tooltip theme={theme} text={`Ez a kártya ${i * 150}ms késleltetéssel jelenik meg.`}>
                                <Card theme={theme} animate={animate}>
                                    <div className="flex justify-between items-center mb-2">
                                        <Badge theme={theme}>Delay: {i * 150}ms</Badge>
                                        <span className="text-2xl">⏱️</span>
                                    </div>
                                    <h3 className="font-bold text-lg">Kártya {i + 1}</h3>
                                    <p className="opacity-70 text-sm mt-2">
                                        Egymás után úsznak be, nem egyszerre. Ez sokkal folyékonyabb érzetet ad.
                                    </p>
                                </Card>
                            </Tooltip>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. SECTION: AMBIENT MOTIONS */}
            <section>
                <div className="mb-6 border-b border-gray-400/20 pb-2">
                    <h2 className={`text-2xl font-bold ${theme === 'minimal' ? 'text-gray-900' : 'text-inherit'}`}>2. Ambient (Élő) Effektek</h2>
                    <p className="opacity-70 text-sm">Ezek folyamatosan futnak, hogy felhívják a figyelmet.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pulse */}
                    <Card theme={theme} animate={false}>
                        <div className="flex items-center gap-4">
                            <Tooltip theme={theme} text="A 'Pulse' animáció lüktet, mint egy szívverés. Jó státuszjelzésre.">
                                <div className="relative flex h-6 w-6">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500"></span>
                                </div>
                            </Tooltip>
                            <div>
                                <h3 className="font-bold">Ping / Radar Effekt</h3>
                                <p className="text-sm opacity-70">Sürgős figyelmeztetéshez vagy "Élő" státuszhoz.</p>
                            </div>
                        </div>
                    </Card>

                    {/* Float */}
                    <Card theme={theme} animate={false} className="flex flex-col items-center justify-center">
                        <Tooltip theme={theme} text="A lebegés nyugtató hatású, és kiemeli a fő elemet a síkból.">
                            <div className="animate-float bg-gradient-to-r from-blue-500 to-teal-400 w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center text-3xl mb-4">
                                👻
                            </div>
                        </Tooltip>
                        <h3 className="font-bold">Floating / Lebegés</h3>
                        <p className="text-sm opacity-70">Hero képekhez vagy kiemelt kártyákhoz.</p>
                    </Card>
                </div>
            </section>

            {/* 3. SECTION: MICRO-INTERACTIONS */}
            <section>
                <div className="mb-6 border-b border-gray-400/20 pb-2">
                    <h2 className={`text-2xl font-bold ${theme === 'minimal' ? 'text-gray-900' : 'text-inherit'}`}>3. Mikro-interakciók</h2>
                    <p className="opacity-70 text-sm">Visszajelzés a felhasználó tetteire.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shake Demo */}
                    <Card theme={theme} animate={false}>
                        <h3 className="font-bold mb-4">Hiba Visszajelzés (Shake)</h3>
                        <div className="flex gap-2">
                            <Tooltip theme={theme} text="Ha érvénytelen az adat, az input vagy gomb megrázza magát. Próbáld ki!">
                                <Input 
                                    theme={theme} 
                                    animate={false} 
                                    placeholder="Kattints a gombra ->" 
                                    className={shake ? "animate-shake border-red-500 text-red-500" : ""}
                                />
                            </Tooltip>
                            <Button theme={theme} animate={animate} onClick={triggerShake} className={shake ? "bg-red-600" : ""}>
                                Validálás
                            </Button>
                        </div>
                        <p className="text-xs mt-2 opacity-60">Kattints a "Validálás" gombra a hatáshoz.</p>
                    </Card>

                    {/* Scale Press */}
                    <Card theme={theme} animate={false}>
                        <h3 className="font-bold mb-4">Gomb Nyomásérzet</h3>
                        <div className="flex justify-center h-full items-center pb-4">
                            <Tooltip theme={theme} text="A gomb aktív állapotban (kattintáskor) 95%-ra kicsinyül.">
                                <button className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-90 bg-blue-600`}>
                                    Nyomj meg erősen! 
                                </button>
                            </Tooltip>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
      );
    }

    // --- MÁS LAYOUTOK (GRID, HERO, STB.) - RÖVIDÍTVE ---
    // (Csak hogy a kód teljes legyen és ne törjön el, visszatesszük a Grid/Tech nézetet is egyszerűsítve)
    if (layout === "tech") return <OptimisticDemo theme={theme} />;
    
    // Default Grid (fallback)
    const items = Array.from({ length: 6 }).map((_, i) => ({ id: i, title: `Projekt ${i + 1}`, desc: "Demo tartalom" }));
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in duration-500">
        {items.map((item) => (
          <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: `${item.id * 100}ms` }}>
            <Card theme={theme} animate={animate}>
                <h3 className="font-bold">{item.title}</h3>
                <p className="opacity-75">{item.desc}</p>
                <div className="mt-4"><Button theme={theme} animate={animate} onClick={() => addToast("Teszt")}>Klikk</Button></div>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className={`min-h-screen p-4 transition-colors duration-700 ${getBackgroundClass()}`}>
      <ToastContainer theme={theme} messages={toasts} />
      <Modal theme={theme} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Info">
        <p>Ez a modal.</p>
      </Modal>

      {/* HEADER */}
      <div className="sticky top-4 z-40 max-w-6xl mx-auto mb-8">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 md:p-4 text-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="font-bold text-xl">🎨 UI Labs</div>
            <div className="flex flex-wrap justify-center gap-2">
              <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                {(['animations', 'tech', 'grid'] as LayoutType[]).map((l) => (
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
              <button onClick={() => setAnimate(!animate)} className={`w-8 h-8 flex-shrink-0 rounded-lg border ${animate ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>{animate ? '▶' : '⏸'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">{renderContent()}</div>
    </main>
  );
}