"use client";

import { useOptimistic, useState, useRef } from "react";
import { Button, Card, Input, ThemeType, Spinner } from "./DesignSystem";

// Egy üzenet típusa
type Message = {
  id: number;
  text: string;
  sending: boolean; // Ez jelzi, hogy épp "úton van-e" az üzenet
};

export default function OptimisticDemo({ theme }: { theme: ThemeType }) {
  // Alap állapot (amit a szerver "visszaad")
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Szia! Ez egy szimulált chat.", sending: false },
    { id: 2, text: "Próbálj meg írni valamit!", sending: false },
  ]);

  // REF: A form reseteléséhez
  const formRef = useRef<HTMLFormElement>(null);
  
  // STATE: Betöltés állapota
  const [isSending, setIsSending] = useState(false);

  // --- AZ ÚJ GENERÁCIÓS MAGIC: useOptimistic ---
  // Ez a hook két értéket ad vissza:
  // 1. optimisticMessages: A lista, amit a felhasználó LÁT (azonnal frissül)
  // 2. addOptimisticMessage: A funkció, amivel hozzáadunk egy ideiglenes elemet
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage]
  );

  // Ez a funkció fut le, amikor elküldöd a formot
  async function sendMessage(formData: FormData) {
    const text = formData.get("message") as string;
    if (!text) return;

    // 1. OPTIMISTA FRISSÍTÉS: Azonnal kirakjuk a képernyőre (szürkén)
    // Még el sem indult a kérés a szerver felé!
    addOptimisticMessage({
      id: Math.random(),
      text: text,
      sending: true, // Jelöljük, hogy ez még csak optimista adat
    });

    setIsSending(true);
    formRef.current?.reset(); // Form törlése azonnal

    // 2. SZIMULÁLT SZERVER KÉSLELTETÉS (2 másodperc)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. VÉGLEGESÍTÉS: A "szerver" válaszolt, hozzáadjuk a valódi state-hez
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: text, sending: false },
    ]);
    setIsSending(false);
  }

  return (
    <Card theme={theme} animate={false} className="h-96 flex flex-col">
      <div className="flex justify-between items-center border-b border-gray-500/20 pb-4 mb-4">
        <h3 className="font-bold text-lg">🚀 Optimistic UI Demo</h3>
        <div className="text-xs opacity-60">React 19 / Next.js 16</div>
      </div>

      {/* Üzenetek listája (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {optimisticMessages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.sending 
                ? "ml-auto bg-gray-500/20 opacity-70 border border-dashed border-gray-400" // Épp küldés alatt (Optimista)
                : index % 2 === 0 
                  ? "mr-auto bg-gray-500/10" // Bejövő
                  : "ml-auto bg-blue-500 text-white shadow-md" // Saját (Megerősített)
            }`}
          >
            <div className="flex items-center gap-2">
                <p>{msg.text}</p>
                {/* Ha épp küldés alatt van, mutassunk egy kis órát */}
                {msg.sending && <span className="text-xs animate-pulse">⏳</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <form ref={formRef} action={sendMessage} className="flex gap-2">
        <Input 
            theme={theme} 
            animate={false} 
            placeholder="Írj üzenetet (pl: Szia!)" 
            name="message" 
        />
        <Button theme={theme} animate={false} disabled={isSending}>
           {isSending ? <Spinner theme={theme} /> : "Küldés"}
        </Button>
      </form>
    </Card>
  );
}