"use client";

import React, { useState } from "react";

// --- Típusok ---
export type ThemeType = "minimal" | "dark" | "gradient" | "glass";

interface BaseProps {
  theme: ThemeType;
  animate?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

// --- Stílus definíciók ---
const getThemeStyles = (theme: ThemeType, type: "card" | "button" | "input" | "modal" | "toggle" | "spinner" | "tooltip" | "skeleton") => {
  const styles = {
    minimal: {
      card: "bg-white border border-gray-200 text-gray-800 shadow-sm",
      button: "bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-400",
      input: "bg-gray-50 border border-gray-300 text-gray-900 focus:ring-gray-500",
      modal: "bg-white text-gray-900 shadow-2xl border border-gray-100",
      toggle: "bg-gray-900",
      spinner: "border-gray-900",
      tooltip: "bg-gray-900 text-white",
      skeleton: "bg-gray-200",
    },
    dark: {
      card: "bg-gray-800 border border-gray-700 text-gray-100 shadow-md",
      button: "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-600",
      input: "bg-gray-700 border border-gray-600 text-white focus:ring-blue-500",
      modal: "bg-gray-800 text-white border border-gray-700 shadow-2xl",
      toggle: "bg-blue-600",
      spinner: "border-blue-500",
      tooltip: "bg-blue-600 text-white",
      skeleton: "bg-gray-700",
    },
    gradient: {
      card: "bg-white/90 border-none text-purple-900 shadow-xl",
      button: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50",
      input: "bg-white/50 border border-purple-200 text-purple-900 focus:ring-purple-400",
      modal: "bg-white/95 text-purple-900 border-none shadow-2xl shadow-purple-500/20",
      toggle: "bg-gradient-to-r from-purple-500 to-pink-500",
      spinner: "border-purple-600",
      skeleton: "bg-purple-100",
    },
    glass: {
      card: "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg",
      button: "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm disabled:bg-white/10",
      input: "bg-black/20 border border-white/10 text-white placeholder-gray-300 focus:ring-white/50",
      modal: "bg-black/60 backdrop-blur-xl border border-white/20 text-white shadow-2xl",
      toggle: "bg-white/40",
      spinner: "border-white",
      tooltip: "bg-black/80 border border-white/20 text-white backdrop-blur-md",
      skeleton: "bg-white/10 border border-white/5",
    },
  };
  return styles[theme][type] || "";
};

// --- SKELETON KOMPONENSEK (ÚJ!) ---

export const Skeleton = ({ theme, className = "" }: { theme: ThemeType, className?: string }) => {
  const baseClass = getThemeStyles(theme, "skeleton");
  return (
    <div className={`shimmer-wrapper rounded ${baseClass} ${className}`}></div>
  );
};

export const SkeletonCard = ({ theme }: { theme: ThemeType }) => {
    return (
        <Card theme={theme} animate={false}>
            {/* Cím helye */}
            <Skeleton theme={theme} className="h-8 w-3/4 mb-4" />
            {/* Szöveg sorok helye */}
            <Skeleton theme={theme} className="h-4 w-full mb-2" />
            <Skeleton theme={theme} className="h-4 w-5/6 mb-2" />
            <Skeleton theme={theme} className="h-4 w-4/6 mb-6" />
            {/* Gomb helye */}
            <Skeleton theme={theme} className="h-10 w-24 rounded-lg" />
        </Card>
    );
}

// --- UI KOMPONENSEK ---

export const Tooltip = ({ theme, text, children }: { theme: ThemeType, text: string, children: React.ReactNode }) => {
  const style = getThemeStyles(theme, "tooltip");
  return (
    <div className="group relative flex items-center justify-center w-full">
      {children}
      <div className={`absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 text-xs rounded shadow-lg text-center z-50 animate-in fade-in zoom-in duration-200 ${style}`}>
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-current opacity-80"></div>
      </div>
    </div>
  );
};

export const Card = ({ theme, animate, children, className = "", style }: BaseProps) => {
  const baseStyle = getThemeStyles(theme, "card");
  const animationClass = animate ? "transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl" : "";
  
  return (
    <div style={style} className={`p-6 rounded-xl ${baseStyle} ${animationClass} ${className}`}>
      {children}
    </div>
  );
};

export const Button = ({ theme, animate, children, onClick, className = "", disabled }: BaseProps) => {
  const baseStyle = getThemeStyles(theme, "button");
  const animationClass = (animate && !disabled) ? "transition-transform active:scale-95 hover:-translate-y-1" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium shadow-md flex items-center justify-center gap-2 ${baseStyle} ${animationClass} ${className}`}
    >
      {children}
    </button>
  );
};

export const Input = ({ theme, animate, placeholder, name, className = "" }: BaseProps & { placeholder: string, name?: string }) => {
  const baseStyle = getThemeStyles(theme, "input");
  const animationClass = animate ? "transition-all focus:scale-105" : "";

  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      className={`w-full px-4 py-2 rounded-lg outline-none ring-2 ring-transparent ${baseStyle} ${animationClass} ${className}`}
    />
  );
};

export const Badge = ({ theme, children, className="" }: { theme: ThemeType, children: React.ReactNode, className?: string }) => {
  let style = "bg-gray-200 text-gray-800";
  if (theme === 'dark') style = "bg-gray-700 text-blue-300";
  if (theme === 'gradient') style = "bg-pink-100 text-pink-700";
  if (theme === 'glass') style = "bg-white/20 text-white";

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${style} ${className}`}>
      {children}
    </span>
  );
};

export const Spinner = ({ theme }: { theme: ThemeType }) => {
  const colorClass = getThemeStyles(theme, "spinner");
  return (
    <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${colorClass}`}></div>
  );
};

export const Toggle = ({ theme, isActive, onToggle }: { theme: ThemeType, isActive: boolean, onToggle: () => void }) => {
  const activeColor = getThemeStyles(theme, "toggle");
  return (
    <div 
      onClick={onToggle}
      className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isActive ? activeColor : 'bg-gray-400'}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${isActive ? 'translate-x-6' : ''}`}></div>
    </div>
  );
};

export const Modal = ({ theme, isOpen, onClose, title, children }: BaseProps & { isOpen: boolean, onClose: () => void, title: string }) => {
  if (!isOpen) return null;
  const modalStyle = getThemeStyles(theme, "modal");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative z-10 w-full max-w-lg rounded-2xl p-8 transform transition-all animate-in fade-in zoom-in duration-300 ${modalStyle}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 opacity-60 hover:opacity-100">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export const ToastContainer = ({ theme, messages }: { theme: ThemeType, messages: { id: number, text: string }[] }) => {
  const style = theme === 'glass' ? "bg-black/80 backdrop-blur text-white border border-white/20" : 
                theme === 'dark' ? "bg-gray-800 text-white border border-gray-700" : 
                "bg-white text-gray-900 border border-gray-200 shadow-xl";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {messages.map((msg) => (
        <div key={msg.id} className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300 ${style}`}>
          <span className="text-green-500 text-xl">✓</span>
          <p className="font-medium text-sm">{msg.text}</p>
        </div>
      ))}
    </div>
  );
};