"use client";

import { useState } from "react";
import { Button, Card, SkeletonCard, ThemeType, Tooltip, Badge } from "./DesignSystem";

type User = {
  id: number;
  name: string;
  role: string;
  email: string;
};

export default function DataFetchDemo({ theme }: { theme: ThemeType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<User[] | null>(null);

  // Szimulált adatlekérés (Mintha Supabase lenne)
  const fetchData = async () => {
    setIsLoading(true);
    setData(null); // Töröljük a régi adatot, hogy látszódjon a skeleton

    // 3 másodperc várakozás
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // "Megérkezett" az adat
    setData([
      { id: 1, name: "Kovács Anna", role: "UX Designer", email: "anna@example.com" },
      { id: 2, name: "Nagy Gábor", role: "Frontend Dev", email: "gabor@example.com" },
      { id: 3, name: "Szabó Éva", role: "Product Owner", email: "eva@example.com" },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Vezérlő */}
      <Card theme={theme} animate={false} className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold mb-2">Skeleton Loading Demo</h2>
            <p className="opacity-70 text-sm">
                Kattints a gombra, hogy lásd, hogyan kezeljük a várakozást profi módon.
                Nem ugrál a kép, hanem "placeholder" elemek jelennek meg.
            </p>
        </div>
        <Button theme={theme} animate={true} onClick={fetchData} disabled={isLoading}>
          {isLoading ? "Adatok letöltése..." : "Adatok Frissítése"}
        </Button>
      </Card>

      {/* Grid: Itt jelenik meg vagy a Skeleton, vagy az Adat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ÁLLAPOT 1: BETÖLTÉS (LOADING) */}
        {isLoading && (
          <>
            <Tooltip theme={theme} text="Ez egy Skeleton kártya. Jelzi a felhasználónak az elrendezést.">
                <SkeletonCard theme={theme} />
            </Tooltip>
            <SkeletonCard theme={theme} />
            <SkeletonCard theme={theme} />
          </>
        )}

        {/* ÁLLAPOT 2: KÉSZ (DATA) */}
        {!isLoading && data && (
           data.map((user, i) => (
             <div key={user.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <Card theme={theme} animate={true}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {user.name.charAt(0)}
                        </div>
                        <Badge theme={theme}>{user.role}</Badge>
                    </div>
                    <h3 className="font-bold text-xl">{user.name}</h3>
                    <p className="opacity-60 text-sm mt-1 mb-4">{user.email}</p>
                    <Button theme={theme} animate={true} className="w-full text-sm">Profil Megtekintése</Button>
                </Card>
             </div>
           ))
        )}

        {/* ÁLLAPOT 3: ÜRES (KEZDŐ ÁLLAPOT) */}
        {!isLoading && !data && (
            <div className="col-span-1 md:col-span-3 text-center py-20 opacity-50 border-2 border-dashed border-gray-300 rounded-xl">
                <p>Nincs megjeleníthető adat. Indítsd el a lekérdezést!</p>
            </div>
        )}

      </div>
    </div>
  );
}