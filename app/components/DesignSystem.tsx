"use client";

import React from "react";

// --- Típusok ---
type ThemeType = "minimal" | "dark" | "gradient" | "glass";

interface BaseProps {
  theme: ThemeType;
  animate: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// --- Segédfüggvény a stílusokhoz ---
const getThemeStyles = (theme: ThemeType, type: "card" | "button" | "input" | "text") => {
  const styles = {
    minimal: {
      card: "bg-white border border-gray-200 text-gray-800 shadow-sm",
      button: "bg-gray-900 text-white hover:bg-gray-700",
      input: "bg-gray-50 border border-gray-300 text-gray-900 focus:ring-gray-500",
      text: "text-gray-800",
    },
    dark: {
      card: "bg-gray-800 border border-gray-700 text-gray-100 shadow-md",
      button: "bg-blue-600 text-white hover:bg-blue-500",
      input: "bg-gray-700 border border-gray-600 text-white focus:ring-blue-500",
      text: "text-gray-100",
    },
    gradient: {
      card: "bg-white/90 border-none text-purple-900 shadow-xl",
      button: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90",
      input: "bg-white/50 border border-purple-200 text-purple-900 focus:ring-purple-400",
      text: "text-purple-900",
    },
    glass: {
      card: "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg",
      button: "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm",
      input: "bg-black/20 border border-white/10 text-white placeholder-gray-300 focus:ring-white/50",
      text: "text-white",
    },
  };
  return styles[theme][type];
};

// --- Komponensek ---

export const Card = ({ theme, animate, children, className = "" }: BaseProps) => {
  const baseStyle = getThemeStyles(theme, "card");
  const animationClass = animate ? "transition-all duration-500 hover:scale-105 hover:shadow-2xl" : "";
  
  return (
    <div className={`p-6 rounded-xl ${baseStyle} ${animationClass} ${className}`}>
      {children}
    </div>
  );
};

export const Button = ({ theme, animate, children, onClick }: BaseProps) => {
  const baseStyle = getThemeStyles(theme, "button");
  const animationClass = animate ? "transition-transform active:scale-95 hover:-translate-y-1" : "";

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium ${baseStyle} ${animationClass}`}
    >
      {children}
    </button>
  );
};

export const Input = ({ theme, animate, placeholder }: BaseProps & { placeholder: string }) => {
  const baseStyle = getThemeStyles(theme, "input");
  const animationClass = animate ? "transition-all focus:scale-105" : "";

  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`w-full px-4 py-2 rounded-lg outline-none ring-2 ring-transparent ${baseStyle} ${animationClass}`}
    />
  );
};

export const Badge = ({ theme, children }: { theme: ThemeType, children: React.ReactNode }) => {
  let style = "bg-gray-200 text-gray-800";
  if (theme === 'dark') style = "bg-gray-700 text-blue-300";
  if (theme === 'gradient') style = "bg-pink-100 text-pink-700";
  if (theme === 'glass') style = "bg-white/20 text-white";

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${style}`}>
      {children}
    </span>
  );
};