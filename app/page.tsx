"use client";

import { useState } from "react";
import { Button, Card, Input, Badge, Modal, Toggle, ToastContainer, ThemeType } from "./components/DesignSystem";

type LayoutType = "grid" | "hero" | "sidebar" | "list";

export default function DesignPlayground() {
  // --- STATE (Állapotok) ---
  const [layout, setLayout] = useState<LayoutType>("grid");
  const [theme, setTheme] = useState<ThemeType>("minimal");
  const [animate, setAnimate] = useState<boolean>(true);
  
  // Interaktív elemek state-jei
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: number, text: string}[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // --- Logika ---
  const addToast = (text: string) => {
    if (!notificationsEnabled) return;
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    // 3 másodperc után eltűnik
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const getBackgroundClass = () => {
    switch (theme) {
      case "dark": return "bg-gray-900";
      case "gradient": return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500";
      case "glass": return "bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center bg-fixed";
      default: return "bg-gray-50"; 
    }
  };

  // --- Tartalom Renderelő ---
  const renderContent = () => {
    const items = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      title: `Interaktív Kártya ${i + 1}`,
      desc: "Kattints a részletekre egy értesítéshez, vagy az inputba gépeléshez.",
    }));

    // --- HERO LAYOUT ---
    if (layout === "hero") {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
          <Card theme={theme} animate={animate} className="max-w-2xl w-full p-12">
            <Badge theme={theme}>v2.0 Frissítve</Badge>
            <h1 className={`text-5xl font-extrabold mt-6 mb-6 ${theme === 'minimal' ? 'text-gray-900' : 'text-inherit'}`}>
              Üdvözöllek a Jövőben
            </h1>
            <p className="mb-8 opacity-80 text-xl leading-relaxed">
              Ez a felület most már képes modal ablakokat kezelni és toast üzeneteket küldeni.
              Próbáld ki a lenti gombokat!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button theme={theme} animate={animate} onClick={() => setIsModalOpen(true)}>
                Modal Megnyitása
              </Button>
              <Button theme={theme} animate={animate} onClick={() => addToast("Ez egy Toast üzenet!")}>
                Teszt Értesítés
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // --- SIDEBAR LAYOUT ---
    if (layout === "sidebar") {
      return (
        <div className="flex flex-col md:flex-row gap-6 h-full animate-in slide-in-from-left duration-500">
          <Card theme={theme} animate={animate} className="w-full md:w-1/4 h-fit sticky top-24">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200 text-gray-700'}`}>UI</div>
                <div className="font-bold">Menü</div>
            </div>
            <ul className="space-y-3 opacity-80 cursor-pointer">
              <li className="hover:font-bold transition-all" onClick={() => addToast("Navigáció: Dashboard")}>Dashboard</li>
              <li className="hover:font-bold transition-all" onClick={() => addToast("Navigáció: Beállítások")}>Beállítások</li>
              <li className="hover:font-bold transition-all" onClick={() => setIsModalOpen(true)}>Profil Szerkesztése</li>
            </ul>
            <div className="mt-8 border-t pt-4 border-gray-500/20">
                <div className="flex justify-between items-center">
                    <span className="text-sm">Értesítések</span>
                    <Toggle theme={theme} isActive={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />
                </div>
            </div>
          </Card>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.slice(0, 4).map((item) => (
              <Card key={item.id} theme={theme} animate={animate}>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="opacity-70 text-sm mt-2">{item.desc}</p>
                <div className="mt-4 flex gap-2">
                  <Button theme={theme} animate={animate} onClick={() => addToast(`Hozzáadva: ${item.title}`)}>Mentés</Button>
                  <Button theme={theme} animate={animate} onClick={() => setIsModalOpen(true)} className="opacity-70">Info</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // --- GRID / LIST LAYOUT ---
    return (
      <div className={`grid gap-6 animate-in zoom-in duration-500 ${layout === 'list' ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {items.map((item) => (
          <Card key={item.id} theme={theme} animate={animate}>
             <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold 
                  ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100 text-gray-600'}`}>
                  {item.id + 1}
                </div>
                <Badge theme={theme}>Új</Badge>
             </div>
            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
            <p className="opacity-75 mb-4">{item.desc}</p>
            <Input theme={theme} animate={animate} placeholder="Írj valamit..." />
            <div className="mt-4 flex justify-between items-center">
               <span className="text-xs opacity-50 font-mono">ID: {item.id + 2042}</span>
               <Button theme={theme} animate={animate} onClick={() => addToast(`${item.title} részletek megnyitva!`)}>Részletek</Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <main className={`min-h-screen p-4 transition-colors duration-700 ${getBackgroundClass()}`}>
      
      {/* --- TOAST CONTAINER (Jobb alul) --- */}
      <ToastContainer theme={theme} messages={toasts} />

      {/* --- MODAL (Középen, ha aktív) --- */}
      <Modal theme={theme} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Minta Dialógus">
        <p className="mb-4 opacity-80">
            Ez egy teljesen szétválasztott komponens. Észreveszed, hogy a stílusa automatikusan illeszkedik a kiválasztott témához ({theme})?
        </p>
        <div className="bg-gray-500/10 p-4 rounded-lg mb-4">
            <h4 className="font-bold text-sm mb-2">Beállítások:</h4>
            <div className="flex justify-between items-center mb-2">
                <span>Értesítések engedélyezése</span>
                <Toggle theme={theme} isActive={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />
            </div>
        </div>
        <Input theme={theme} animate={false} placeholder="Írd be a neved a megerősítéshez..." />
      </Modal>

      {/* --- VEZÉRLŐPULT (Fixed Top) --- */}
      <div className="sticky top-4 z-40 max-w-6xl mx-auto mb-8">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 md:p-4 text-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            
            <div className="font-bold text-xl flex items-center gap-2">
                <span>🎨</span> 
                <span className="hidden sm:inline">Playground</span>
            </div>

            <div className="flex flex-wrap justify-center gap-2 w-full lg:w-auto">
              {/* Layout gombok */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {(['grid', 'list', 'hero', 'sidebar'] as LayoutType[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLayout(l)}
                    className={`px-3 py-1 rounded-md text-sm transition-all ${layout === l ? 'bg-white shadow-sm font-bold text-black' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>

              {/* Téma Választó */}
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value as ThemeType)}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="minimal">Minimal</option>
                <option value="dark">Dark</option>
                <option value="gradient">Gradient</option>
                <option value="glass">Glass</option>
              </select>

              {/* Animáció Toggle */}
              <button
                onClick={() => setAnimate(!animate)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${animate ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-100 text-gray-400'}`}
                title="Animációk"
              >
                {animate ? '▶' : '⏸'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- TARTALOM HELYE --- */}
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>

    </main>
  );
}