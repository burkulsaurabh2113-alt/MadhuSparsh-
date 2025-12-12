
import React, { useState, useEffect, useRef } from 'react';
import { Section, Language, Hba1cLevel, DietType, ExerciseType, Trimester, Patient, ChatMessage, PediatricAgeGroup, InfantSubGroup, Gender, ActivityLevel, DailyMeal } from './types';
import { getTranslation } from './utils/translations';
import { getDietPlan, getPreDiabeticDietPlan, getGdmDietPlan, getPediatricDietPlan, getDayName, getMealLabel } from './data/dietData';
import { getWhoPercentile, getWhoStandards, WHO_DATA } from './data/whoData';
import { GoogleGenAI } from "@google/genai";
import { Gauge } from './components/ui/gauge';

// --- SVG ICONS ---
const Icons = {
  Diabetes: () => <svg className="w-8 h-8 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  PreDiabetes: () => <svg className="w-8 h-8 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  GDM: () => <svg className="w-8 h-8 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Patient: () => <svg className="w-8 h-8 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Exercise: () => <svg className="w-8 h-8 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Nutrients: () => <svg className="w-8 h-8 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Nutrition: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  Pediatric: () => <svg className="w-8 h-8 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Back: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Play: () => <svg className="w-8 h-8 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Print: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>,
  Brand: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>,
  Doctor: () => <svg className="w-16 h-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6" /></svg>,
  Logo: () => (
    <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gradHoney" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <linearGradient id="gradLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M100 170 C 50 170, 30 100, 100 30 C 170 100, 150 170, 100 170 Z" fill="url(#gradLeaf)" stroke="#166534" strokeWidth="2" filter="url(#glow)" />
      <path d="M100 30 Q 100 100 100 170" stroke="#166534" strokeWidth="2" fill="none" opacity="0.5"/>
      <path d="M100 65 Q 65 85 55 100" stroke="#166534" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <path d="M100 65 Q 135 85 145 100" stroke="#166534" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <path d="M100 100 Q 65 120 55 135" stroke="#166534" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <path d="M100 100 Q 135 120 145 135" stroke="#166534" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <path d="M100 120 C 100 120, 88 140, 88 150 A 12 12 0 0 0 112 150 C 112 140, 100 120, 100 120 Z" fill="url(#gradHoney)" stroke="#b45309" strokeWidth="1" />
      <ellipse cx="96" cy="146" rx="2" ry="4" fill="white" opacity="0.6" transform="rotate(-20 96 146)" />
    </svg>
  ),
};

const ThreeDTabs = ({ activeTab, onTabChange, t }: any) => (
  <div className="relative p-2 bg-slate-200/50 backdrop-blur-md rounded-2xl flex shadow-inner border border-white/40 mb-8 mx-auto w-full max-w-md perspective-container">
    <div 
      className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-500 ease-spring z-0 ${activeTab === 'GROWTH' ? 'left-[calc(50%+4px)]' : 'left-2'}`}
      style={{ transform: 'translateZ(10px)' }} 
    />
    <button onClick={() => onTabChange('DIET')} className={`flex-1 relative z-10 py-3 rounded-xl text-sm font-black tracking-wide transition-colors duration-300 ${activeTab === 'DIET' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}>{t.pediatric.tabs?.diet || "MEAL PLAN"}</button>
    <button onClick={() => onTabChange('GROWTH')} className={`flex-1 relative z-10 py-3 rounded-xl text-sm font-black tracking-wide transition-colors duration-300 ${activeTab === 'GROWTH' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}>{t.pediatric.tabs?.growth || "GROWTH TRACKER"}</button>
  </div>
);

const GenderToggle = ({ value, onChange }: { value: Gender, onChange: (g: Gender) => void }) => (
  <div className="flex bg-slate-100 p-1 rounded-2xl relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-white h-14 w-full mb-6 perspective-container">
      <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-all duration-500 ease-spring ${value === 'Girl' ? 'left-[calc(50%+2px)]' : 'left-1'}`} />
      <button onClick={() => onChange('Boy')} className={`flex-1 relative z-10 flex items-center justify-center space-x-2 font-black transition-colors duration-300 ${value === 'Boy' ? 'text-blue-600' : 'text-slate-400'}`}><span className="text-xl">👦</span><span className="tracking-wide">BOY</span></button>
      <button onClick={() => onChange('Girl')} className={`flex-1 relative z-10 flex items-center justify-center space-x-2 font-black transition-colors duration-300 ${value === 'Girl' ? 'text-pink-600' : 'text-slate-400'}`}><span className="text-xl">👧</span><span className="tracking-wide">GIRL</span></button>
  </div>
);

const WeightZones = ({ gender, years, months }: { gender: Gender, years: number, months: number }) => {
    const ageMonths = (years * 12) + months;
    const { p3, p15, p50, p85, p97 } = getWhoStandards(gender, ageMonths);

    return (
        <div className="space-y-4 mt-6 mb-8 animate-slide-up perspective-container">
            <div className="flex justify-between items-end mb-2 px-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated WHO Standards</h4>
                <div className="text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-md">{years}y {months}m</div>
            </div>
            <div className="card-3d relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 to-white border border-red-100 p-4 flex justify-between items-center group shadow-sm hover:shadow-red-100">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-400"></div>
                <div className="pl-4 card-content-3d"><div className="text-[10px] font-black text-red-400 uppercase tracking-wider mb-0.5">Severely Underweight</div></div>
                <div className="text-xl font-black text-red-500 card-content-3d">&lt; {p3} <span className="text-xs font-bold text-red-300">kg</span></div>
            </div>
            <div className="card-3d relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100 p-4 flex justify-between items-center group shadow-sm hover:shadow-orange-100">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-400"></div>
                <div className="pl-4 card-content-3d"><div className="text-[10px] font-black text-orange-400 uppercase tracking-wider mb-0.5">Underweight</div></div>
                <div className="text-xl font-black text-orange-500 card-content-3d">{p3} - {p15} <span className="text-xs font-bold text-orange-300">kg</span></div>
            </div>
             <div className="card-3d relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 p-5 flex justify-between items-center shadow-lg shadow-emerald-100/50 scale-[1.03] ring-1 ring-emerald-100 z-10">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500"></div>
                <div className="pl-4 card-content-3d"><div className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2 mb-0.5">Healthy Weight <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span></div></div>
                <div className="text-2xl font-black text-emerald-600 card-content-3d">{p15} - {p85} <span className="text-sm font-bold text-emerald-400">kg</span></div>
            </div>
             <div className="card-3d relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50 to-white border border-purple-100 p-4 flex justify-between items-center group shadow-sm hover:shadow-purple-100">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-400"></div>
                <div className="pl-4 card-content-3d"><div className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-0.5">Overweight</div></div>
                <div className="text-xl font-black text-purple-500 card-content-3d">&gt; {p85} <span className="text-xs font-bold text-purple-300">kg</span></div>
            </div>
        </div>
    )
}

// Falling Fruits Animation Component
const FallingFruits = () => {
  const [items, setItems] = useState<Array<{ id: number, emoji: string, left: number, delay: number, duration: number }>>([]);

  useEffect(() => {
    const emojis = ['🍎', '🥦', '🥕', '🍇', '🍌', '🌽', '🥬', '🥭', '🍅'];
    const newItems = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-2xl opacity-40 animate-fall"
          style={{
            left: `${item.left}%`,
            top: '-50px',
            animation: `fall ${item.duration}s linear infinite`,
            animationDelay: `${item.delay}s`
          }}
        >
          {item.emoji}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// --- ORBIT LOGO COMPONENT ---
const OrbitLogo = () => {
  return (
    <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
      <div className="absolute z-20 w-40 h-40">
        <Icons.Logo />
      </div>
      <div className="absolute inset-0 rounded-full border border-dashed border-emerald-200/50 scale-110 animate-[pulse_4s_ease-in-out_infinite]"></div>
      <div className="absolute inset-0 rounded-full border border-green-100/30 scale-150"></div>
      
      {/* Orbiting Fruits */}
      <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-2xl">🍎</div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-2xl">🥦</div>
         <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 text-2xl">🥕</div>
         <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-2xl">🍇</div>
      </div>
    </div>
  );
};

const SectionAnimation: React.FC<{ type: string }> = ({ type }) => {
    return <div className="w-full h-4 mb-4" />;
};

const LiveAnimation: React.FC<{ type: string; subType?: string }> = ({ type, subType }) => {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 360); 
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const breathe = Math.sin(frame * 0.05) * 5;
  const walk = Math.abs(Math.sin(frame * 0.1)) * 10;

  return (
    <div className="flex justify-center mb-8 h-56 items-end overflow-visible relative perspective-container">
       <div className="absolute bottom-0 w-3/4 h-24 bg-gradient-to-t from-slate-200/50 to-transparent rounded-[100%] transform rotateX(60deg) scale-150 blur-md -z-10"></div>
       <svg width="340" height="220" viewBox="0 0 340 220" className="drop-shadow-2xl overflow-visible">
        {/* Human-like simplified figure for general diets */}
        {(type === 'diabetic' || type === 'pre-diabetic' || type === 'patient') && (
           <g transform="translate(170, 160)">
               <ellipse cx="0" cy="30" rx="40" ry="10" fill="#cbd5e1" opacity="0.5" />
               <g transform={`translate(0, ${breathe})`}>
                   {/* Body */}
                   <path d="M-15 -40 Q -25 -20 -15 0 L -10 30 L 10 30 L 15 0 Q 25 -20 15 -40 Z" fill="#64748b" />
                   {/* Head */}
                   <circle cx="0" cy="-55" r="12" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
                   {/* Arms holding items */}
                   <path d="M-15 -35 Q -30 -30 -40 -45" stroke="#475569" strokeWidth="4" strokeLinecap="round" fill="none" />
                   <path d="M15 -35 Q 30 -30 40 -45" stroke="#475569" strokeWidth="4" strokeLinecap="round" fill="none" />
                   {/* Items */}
                   <g transform={`translate(-40, -45) rotate(${Math.sin(frame * 0.1) * 10})`}>
                       <text fontSize="20" x="-10" y="10">🥗</text>
                   </g>
                   <g transform={`translate(40, -45) rotate(${-Math.sin(frame * 0.1) * 10})`}>
                       <text fontSize="20" x="-10" y="10">🍎</text>
                   </g>
               </g>
           </g>
        )}
        {(type === 'pediatric' || type === 'gdm') && (
           <g transform="translate(170, 160)">
              <ellipse cx="0" cy="30" rx="100" ry="15" fill={type === 'gdm' ? "#fce7f3" : "#dcfce7"} />
              {(!subType || subType.includes('6m') || subType.includes('12m') || type === 'gdm') && (
                  <g transform={`translate(${Math.sin(frame * 0.05) * 30}, 10)`}>
                      <circle cx="-15" cy="-10" r="10" fill={type === 'gdm' ? "#fbcfe8" : "#fecaca"} />
                      <ellipse cx="0" cy="0" rx="15" ry="10" fill={type === 'gdm' ? "#f472b6" : "#60a5fa"} />
                      <circle cx="10" cy="5" r="3" fill="#fecaca" />
                      <circle cx="-10" cy="5" r="3" fill="#fecaca" />
                      <rect x="25" y="-5" width="10" height="10" fill="#facc15" transform={`rotate(${frame})`} />
                      {type === 'gdm' && (
                          <g transform="translate(0, -60)">
                              <text fontSize="24">🤰</text>
                          </g>
                      )}
                  </g>
              )}
              {(type === 'pediatric' && subType && (subType.includes('1-3y') || subType.includes('4-6y'))) && (
                  <g>
                      <circle cx={50} cy={-10 - Math.abs(Math.sin(frame * 0.15) * 40)} r="8" fill="#ef4444" stroke="#b91c1c" />
                      <g transform={`translate(-20, ${-Math.abs(Math.sin(frame * 0.15) * 5)})`}>
                          <rect x="-8" y="-30" width="16" height="25" rx="4" fill="#facc15" />
                          <circle cx="0" cy="-38" r="11" fill="#fecaca" />
                          <path d="M-6 -5 L -10 15" stroke="#333" strokeWidth="4" strokeLinecap="round" />
                          <path d="M6 -5 L 10 15" stroke="#333" strokeWidth="4" strokeLinecap="round" />
                      </g>
                  </g>
              )}
              {(type === 'pediatric' && subType && subType.includes('7-9y')) && (
                  <g transform={`translate(0, 0)`}>
                      <g transform={`translate(0, ${-walk/3})`}>
                          <rect x="-8" y="-35" width="16" height="28" rx="3" fill="#3b82f6" />
                          <circle cx="0" cy="-44" r="10" fill="#fecaca" />
                          <path d="M-4 -7 L -15 15" stroke="#333" strokeWidth="4" strokeLinecap="round" transform={`rotate(${Math.sin(frame * 0.2) * 30} -4 -7)`} />
                          <path d="M4 -7 L 15 15" stroke="#333" strokeWidth="4" strokeLinecap="round" transform={`rotate(${-Math.sin(frame * 0.2) * 30} 4 -7)`} />
                      </g>
                  </g>
              )}
           </g>
        )}
       </svg>
    </div>
  );
};

interface SelectionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  activeColorClass: string;
  icon?: string;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ label, selected, onClick, activeColorClass, icon }) => (
  <button onClick={onClick} className={`relative w-full p-4 rounded-2xl transition-all duration-300 border-2 flex flex-col items-center justify-center text-center group ${selected ? `${activeColorClass} text-white border-transparent shadow-lg scale-[1.02] ring-2 ring-offset-2 ring-transparent` : `bg-white/70 backdrop-blur-sm text-slate-600 border-transparent hover:bg-white hover:shadow-md hover:scale-[1.01]`}`}>
    {icon && <div className="mb-2 text-2xl animate-bounce" style={{ animationDuration: '2s' }}>{icon}</div>}
    <span className="font-bold text-sm md:text-base">{label}</span>
    {selected && (<div className="absolute right-3 top-3 w-2 h-2 bg-white rounded-full animate-pulse shadow-sm hidden sm:block" />)}
  </button>
);

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'mr', label: 'मराठी' }, { code: 'hi', label: 'हिंदी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

interface NutritionResult {
  foodName: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  rating: number; // 1-5
  ratingColor: string; // 'red' | 'orange' | 'yellow' | 'green'
  insight: string;
}

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('madhusparsh_lang') as Language) || 'en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => { localStorage.setItem('madhusparsh_lang', lang); }, [lang]);

  const [section, setSection] = useState<Section>(Section.HOME);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [section]);

  const t = getTranslation(lang);
  const [showIntro, setShowIntro] = useState(true);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string>('slate');

  // Diet States
  const [dietStep, setDietStep] = useState(0); 
  const [ddHba1c, setDdHba1c] = useState<Hba1cLevel | null>(null);
  const [ddExercise, setDdExercise] = useState<ExerciseType | null>(null);
  const [ddDiet, setDdDiet] = useState<DietType | null>(null);

  const [preDietStep, setPreDietStep] = useState(0);
  const [pdDiet, setPdDiet] = useState<DietType | null>(null);
  const [pdExercise, setPdExercise] = useState<ExerciseType | null>(null);

  // GDM States - Updated Order
  const [gdmStep, setGdmStep] = useState(0);
  const [gdmTrimester, setGdmTrimester] = useState<Trimester | null>(null);
  const [gdmHba1c, setGdmHba1c] = useState<Hba1cLevel | null>(null);
  const [gdmDiet, setGdmDiet] = useState<DietType | null>(null);
  const [gdmExercise, setGdmExercise] = useState<ExerciseType | null>(null);

  const [pediatricStep, setPediatricStep] = useState(0);
  const [pedAge, setPedAge] = useState<PediatricAgeGroup | null>(null);
  const [pedSubAge, setPedSubAge] = useState<InfantSubGroup | null>(null);
  const [pediatricTab, setPediatricTab] = useState<'DIET' | 'GROWTH'>('DIET');
  
  // Growth Tracker States
  const [growthYears, setGrowthYears] = useState<number>(0);
  const [growthMonths, setGrowthMonths] = useState<number>(0);
  const [growthWeight, setGrowthWeight] = useState<string>('');
  const [growthGender, setGrowthGender] = useState<Gender>('Boy');
  const [growthResult, setGrowthResult] = useState<{status: string, color: string, percentile: number} | null>(null);
  const [showFullWhoChart, setShowFullWhoChart] = useState(false);

  // Patient Data
  const [patientTab, setPatientTab] = useState<'NEW' | 'EXISTING'>('NEW');
  const [existingPatients, setExistingPatients] = useState<Patient[]>([]);
  const [patientForm, setPatientForm] = useState({
    name: '', age: '', weight: '', kco: '', diagnosis: '',
    rbs: '', pp: '', hba1c: '',
    medOld: '', medNew: '', dosage: ''
  });

  // Nutrient Data
  const [nutrientTab, setNutrientTab] = useState<'MACRO' | 'MICRO'>('MACRO');
  const [macroWeight, setMacroWeight] = useState('');
  const [macroActivity, setMacroActivity] = useState<ActivityLevel>('Sedentary');
  const [macroResult, setMacroResult] = useState<{cal: number, carbs: number, pro: number, fat: number} | null>(null);

  const [translatedPlan, setTranslatedPlan] = useState<ReturnType<typeof getDietPlan> | null>(null);
  const [isTranslatingPlan, setIsTranslatingPlan] = useState(false);

  // AI Nutrition & Health Advisor
  const [foodQuery, setFoodQuery] = useState('');
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionResult, setNutritionResult] = useState<NutritionResult | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: t.chat.placeholder || "Hello! I am Dr. Saurabh's AI Assistant. Ask me anything about diabetes or diet.", timestamp: new Date() }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => { setIsOrbiting(true); setTimeout(() => setShowIntro(false), 2000); }, 500); 
    const savedPatients = localStorage.getItem('patient_list');
    if (savedPatients) setExistingPatients(JSON.parse(savedPatients));
    return () => clearTimeout(timer);
  }, []);

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPatientForm({...patientForm, [e.target.name]: e.target.value});
  };

  const savePatient = () => {
      const newPatient: Patient = {
          id: Date.now().toString(),
          name: patientForm.name,
          age: patientForm.age,
          weight: patientForm.weight,
          history: patientForm.kco,
          diagnosis: patientForm.diagnosis,
          bloodGlucose: { rbs: patientForm.rbs, pp: patientForm.pp, hba1c: patientForm.hba1c, date: new Date().toLocaleDateString() },
          medication: { old: patientForm.medOld, new: patientForm.medNew, dosage: patientForm.dosage },
          followUpDate: 'TBD',
          dateAdded: new Date().toLocaleDateString()
      };
      const updated = [newPatient, ...existingPatients];
      setExistingPatients(updated);
      localStorage.setItem('patient_list', JSON.stringify(updated));
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 1000);
      setPatientForm({ name: '', age: '', weight: '', kco: '', diagnosis: '', rbs: '', pp: '', hba1c: '', medOld: '', medNew: '', dosage: '' });
  };

  const calculateMacro = () => {
      const w = parseFloat(macroWeight);
      if(!w) return;
      let multiplier = 30; 
      if(macroActivity === 'Moderate') multiplier = 35;
      if(macroActivity === 'Active') multiplier = 40;
      
      const totalCal = Math.round(w * multiplier);
      const protein = Math.round(w * 0.81);
      const remainingCal = totalCal - (protein * 4);
      const carbs = Math.round((remainingCal * 0.7) / 4); // Approx distribution
      const fat = Math.round((remainingCal * 0.3) / 9);

      setMacroResult({
          cal: totalCal,
          carbs: carbs,
          pro: protein,
          fat: fat
      });
  };

  const calculateGrowth = () => {
    const w = parseFloat(growthWeight);
    if (!w) return;
    const totalMonths = (growthYears * 12) + growthMonths;
    const result = getWhoPercentile(growthGender, totalMonths, w);
    setGrowthResult({
        status: result.status,
        color: result.color,
        percentile: result.percentileValue
    });
    setTimeout(() => {
        const el = document.getElementById('growth-result');
        if(el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const analyzeFood = async () => {
    if (!foodQuery.trim()) return;
    setNutritionLoading(true);
    setNutritionResult(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Analyze nutritional value of 100g "${foodQuery}". Return strictly valid JSON with no markdown: {"foodName": string, "calories": number, "carbs": number, "protein": number, "fat": number, "rating": number (1-5, 5 is best for diabetic), "ratingColor": "red"|"orange"|"yellow"|"green", "insight": "short diabetic advice for this food"}`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        let jsonStr = response.text.trim().replace(/```json|```/g, "");
        setNutritionResult(JSON.parse(jsonStr));
    } catch (e) {
        console.error("Analysis failed", e);
    } finally {
        setNutritionLoading(false);
    }
  };

  const askHealthAdvisor = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `You are Dr. Saurabh's AI assistant for Madhusparsh. Keep answers short, friendly, and focused on diabetes management. Question: ${userMsg.text}`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response.text || "I'm sorry, I couldn't understand that.", timestamp: new Date() };
        setChatMessages(prev => [...prev, aiMsg]);
    } catch (e) {
        console.error("Chat failed", e);
    } finally {
        setChatLoading(false);
    }
  };

  const resetHome = () => {
    setSection(Section.HOME);
    setDietStep(0); setPreDietStep(0); setGdmStep(0); setPediatricStep(0);
    setDdHba1c(null); setDdExercise(null); setDdDiet(null);
    setPdDiet(null); setPdExercise(null);
    setGdmTrimester(null); setGdmHba1c(null); setGdmDiet(null); setGdmExercise(null);
    setPedAge(null); setPedSubAge(null);
    setTranslatedPlan(null);
  };

  const translateDietPlan = async (plan: ReturnType<typeof getDietPlan>) => {
      if (lang === 'en') return;
      setIsTranslatingPlan(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const currentLangLabel = LANGUAGES.find(l => l.code === lang)?.label || 'English';
          const prompt = `Translate values to ${currentLangLabel}. Input JSON: ${JSON.stringify(plan.weekly)}`;
          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          let jsonStr = response.text.trim().replace(/```json|```/g, "");
          const translatedWeekly = JSON.parse(jsonStr);
          setTranslatedPlan({ ...plan, weekly: translatedWeekly });
      } catch (e) { console.error("Translation failed", e); } finally { setIsTranslatingPlan(false); }
  };

  const renderHeader = () => {
    const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
    return (
      <header className="sticky top-0 z-40 w-full flex justify-center pt-4 pb-2 transition-all duration-300 perspective-container no-print">
        <div className="glass-panel mx-4 px-6 py-3 rounded-full flex items-center justify-between shadow-lg max-w-4xl w-full border border-white/40 backdrop-blur-xl">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={resetHome}>
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 bg-white flex items-center justify-center relative"><Icons.Logo /></div>
            <div className="hidden md:block">
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none text-3d-bold">{t.title}</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Dr. Saurabh</p>
            </div>
          </div>
          <div className="relative z-50">
                <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="relative overflow-hidden flex items-center space-x-3 bg-white/80 backdrop-blur-md border border-white/60 shadow-lg hover:shadow-xl rounded-2xl px-2 pl-2 pr-4 py-2 transition-all duration-300 group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-inner">{currentLang.code.toUpperCase()}</div>
                    <span className="text-sm font-bold text-slate-700 hidden sm:inline">{currentLang.label}</span>
                    <span className={`transform transition-transform duration-300 text-indigo-400 ${isLangMenuOpen ? 'rotate-180' : ''}`}><Icons.ChevronDown /></span>
                </button>
                {isLangMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-4 w-64 z-50 perspective-container">
                        <div className="relative animate-fade-scale origin-top-right">
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 -z-10"></div>
                            <div className="p-3 space-y-2">
                                {LANGUAGES.map((l, idx) => (
                                    <button key={l.code} onClick={() => { setLang(l.code as Language); setIsLangMenuOpen(false); setTranslatedPlan(null); }} className={`relative w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${lang === l.code ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'hover:bg-slate-50 hover:shadow-lg text-slate-600'}`}>
                                        <div className="flex items-center space-x-3"><span className="font-bold">{l.label}</span></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                  </>
                )}
            </div>
        </div>
      </header>
    );
  };

  const renderDrInfo = () => (
    <div className="w-full max-w-xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 shadow-xl flex items-center gap-6 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"></div>
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center shrink-0 shadow-inner border-2 border-white relative z-10">
                <Icons.Doctor />
            </div>
            <div className="relative z-10">
                <h3 className="text-xl font-black text-slate-800 mb-1">Dr. Saurabh</h3>
                <div className="space-y-1 text-xs font-medium text-slate-600">
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> MBBS, Shandong First Medical Univ, China</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Internship: Kamala Nehru Hospital, Pune</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Passionate about Diabetic Diet & Mgmt</p>
                </div>
            </div>
        </div>
    </div>
  );

  const renderNutritionFacts = () => (
    <div className="w-full max-w-xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><span className="text-2xl">🍎</span> Nutrition Facts</h3>
            
            <div className="flex gap-2 mb-6">
                <input 
                    value={foodQuery}
                    onChange={(e) => setFoodQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && analyzeFood()}
                    placeholder="Enter food name (e.g. 1 Apple)"
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
                <button onClick={analyzeFood} disabled={nutritionLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2 font-bold transition-all disabled:opacity-50">
                    {nutritionLoading ? <span className="animate-spin block">↻</span> : <Icons.Search />}
                </button>
            </div>

            {nutritionResult && (
                <div className="animate-fade-scale">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="text-lg font-black text-slate-800 capitalize">{nutritionResult.foodName}</h4>
                            <p className="text-xs text-slate-500">{nutritionResult.calories} kcal / 100g</p>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${nutritionResult.ratingColor === 'green' ? 'bg-green-100 text-green-700' : nutritionResult.ratingColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            Diabetic Score: {nutritionResult.rating}/5
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 relative">
                                <Gauge value={nutritionResult.carbs} size="100%" showValue={false} primary="info" strokeWidth={8} />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-blue-600">{nutritionResult.carbs}g</div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Carbs</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 relative">
                                <Gauge value={nutritionResult.protein} size="100%" showValue={false} primary="success" strokeWidth={8} />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-green-600">{nutritionResult.protein}g</div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Protein</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 relative">
                                <Gauge value={nutritionResult.fat} size="100%" showValue={false} primary="warning" strokeWidth={8} />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-orange-600">{nutritionResult.fat}g</div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Fats</span>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-600 font-medium italic">"{nutritionResult.insight}"</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  const renderHealthAdvisor = () => (
    <div className="w-full max-w-xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden h-[400px] flex flex-col">
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><span className="text-2xl">🩺</span> Health Advisor</h3>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin">
                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {chatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs font-medium text-slate-500 animate-pulse">Thinking...</div>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askHealthAdvisor()}
                    placeholder="Ask Dr. AI..."
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none"
                />
                <button onClick={askHealthAdvisor} disabled={chatLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-bold transition-all disabled:opacity-50">
                    <Icons.Send />
                </button>
            </div>
        </div>
    </div>
  );

  const renderHome = () => {
    const items = [
      { id: Section.DIABETIC_DIET, label: t.sections.diabeticDiet, icon: Icons.Diabetes, colorName: 'emerald', bg: 'bg-emerald-100/50', text: 'text-emerald-900', border: 'border-emerald-200' },
      { id: Section.PRE_DIABETIC_DIET, label: t.sections.preDiabeticDiet, icon: Icons.PreDiabetes, colorName: 'teal', bg: 'bg-teal-100/50', text: 'text-teal-900', border: 'border-teal-200' },
      { id: Section.GDM_DIET, label: t.sections.gdmDiet, icon: Icons.GDM, colorName: 'rose', bg: 'bg-rose-100/50', text: 'text-rose-900', border: 'border-rose-200' },
      { id: Section.PEDIATRIC_DIET, label: t.sections.pediatricDiet, icon: Icons.Pediatric, colorName: 'cyan', bg: 'bg-cyan-100/50', text: 'text-cyan-900', border: 'border-cyan-200' },
      { id: Section.PATIENT_DATA, label: t.sections.patientData, icon: Icons.Patient, colorName: 'blue', bg: 'bg-blue-100/50', text: 'text-blue-900', border: 'border-blue-200' },
      { id: Section.EXERCISE, label: t.sections.exercise, icon: Icons.Exercise, colorName: 'indigo', bg: 'bg-indigo-100/50', text: 'text-indigo-900', border: 'border-indigo-200' },
      { id: Section.DAILY_NUTRIENTS, label: t.sections.dailyNutrients, icon: Icons.Nutrients, colorName: 'violet', bg: 'bg-violet-100/50', text: 'text-violet-900', border: 'border-violet-200' },
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] py-8 px-4 w-full max-w-xl mx-auto space-y-10 pb-40 perspective-container">
         <FallingFruits />
         <div className="text-center py-10 animate-fade-scale relative z-20">
            <OrbitLogo />
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 font-sans text-3d-bold mt-4">MADHUSPARSH</h1>
            <div className="animate-float space-y-1">
                <p className="text-xl font-bold text-slate-900 tracking-wider uppercase">By Dr. Saurabh</p>
                <p className="text-lg font-medium text-slate-800 tracking-wide">Regional diet</p>
            </div>
         </div>
         
         <div className="w-full space-y-5 pt-4 relative z-10 mb-8">
            {items.map((item, index) => (
                <div key={item.id} onMouseEnter={() => setHoveredColor(item.colorName)} onMouseLeave={() => setHoveredColor('slate')} onClick={() => { resetHome(); setSection(item.id); }} className={`card-3d group relative w-full ${item.bg} backdrop-blur-md border ${item.border} rounded-[2rem] p-6 cursor-pointer flex items-center justify-between overflow-visible animate-slide-up`} style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="relative z-10 flex flex-col justify-center card-content-3d"><span className={`text-2xl font-bold tracking-tight ${item.text}`}>{item.label}</span></div>
                    <div className={`p-4 rounded-full bg-white/40 ${item.text} backdrop-blur-sm card-icon-3d`}><item.icon /></div>
                </div>
            ))}
         </div>

         {renderNutritionFacts()}
         {renderHealthAdvisor()}
         {renderDrInfo()}
      </div>
    );
  };

  const renderChart = (originalPlan: ReturnType<typeof getDietPlan>) => {
    // ... (rest of the renderChart function remains same)
    const plan = translatedPlan || originalPlan;
    if (!plan) return <div className="text-center p-8 text-slate-500">{t.common.comingSoon}</div>;
    
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-scale print:w-full pb-20">
        <div className="flex justify-end gap-2 mb-4 no-print">
            {lang !== 'en' && !translatedPlan && (
                <button onClick={() => translateDietPlan(originalPlan)} disabled={isTranslatingPlan} className="px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50">
                    {isTranslatingPlan ? <span>{t.login.syncing}</span> : <span>Translate</span>}
                </button>
            )}
             <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-full text-xs font-bold shadow-lg hover:bg-slate-700 transition-all flex items-center gap-2"><Icons.Print /> {t.common.print}</button>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-slate-100 text-center relative overflow-hidden print:shadow-none print:border-2 print:border-black">
          <h2 className="text-2xl font-black text-slate-800 mb-2">{plan.title}</h2>
          <p className="text-indigo-600 font-bold bg-indigo-50 inline-block px-4 py-1 rounded-full text-sm print:bg-transparent print:text-black">{plan.macros}</p>
          {plan.summary && <p className="mt-4 text-slate-600 italic">{plan.summary}</p>}
          {plan.guidelines && (<ul className="mt-4 text-left text-sm text-slate-700 bg-slate-50 p-4 rounded-xl print:bg-transparent">{plan.guidelines.map((g, i) => <li key={i} className="mb-1">• {g}</li>)}</ul>)}
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
          {(Object.entries(plan.weekly) as [string, DailyMeal][]).map(([day, meals], idx) => (
             <div key={day} className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group print:border print:shadow-none print:break-inside-avoid">
                <h3 className="font-bold text-lg text-slate-700 mb-3 border-b border-slate-100 pb-1 flex justify-between items-center print:text-black print:border-black">
                  {getDayName(day, lang)}
                  <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider print:hidden">{t.common.option || 'Day'} {idx + 1}</span>
                </h3>
                <div className="space-y-3 text-sm">
                   {meals.Breakfast && <div className="flex items-start space-x-2"><span className="text-orange-500 font-bold w-4 mt-0.5 print:text-black">☀</span><div><span className="font-bold text-slate-500 text-xs uppercase block print:text-black">{getMealLabel('Breakfast', lang)}</span> <span className="text-slate-700 print:text-black">{meals.Breakfast}</span></div></div>}
                   {meals.MidMorning && <div className="flex items-start space-x-2"><span className="text-teal-500 font-bold w-4 mt-0.5 print:text-black">☕</span><div><span className="font-bold text-slate-500 text-xs uppercase block print:text-black">{getMealLabel('MidMorning', lang)}</span> <span className="text-slate-700 print:text-black">{meals.MidMorning}</span></div></div>}
                   {meals.Lunch && <div className="flex items-start space-x-2"><span className="text-yellow-500 font-bold w-4 mt-0.5 print:text-black">☀</span><div><span className="font-bold text-slate-500 text-xs uppercase block print:text-black">{getMealLabel('Lunch', lang)}</span> <span className="text-slate-700 print:text-black">{meals.Lunch}</span></div></div>}
                   {meals.EveningSnack && <div className="flex items-start space-x-2"><span className="text-orange-400 font-bold w-4 mt-0.5 print:text-black">🍪</span><div><span className="font-bold text-slate-500 text-xs uppercase block print:text-black">{getMealLabel('EveningSnack', lang)}</span> <span className="text-slate-700 print:text-black">{meals.EveningSnack}</span></div></div>}
                   {meals.Dinner && <div className="flex items-start space-x-2"><span className="text-indigo-500 font-bold w-4 mt-0.5 print:text-black">☾</span><div><span className="font-bold text-slate-500 text-xs uppercase block print:text-black">{getMealLabel('Dinner', lang)}</span> <span className="text-slate-700 print:text-black">{meals.Dinner}</span></div></div>}
                </div>
             </div>
          ))}
        </div>
        <div className="flex justify-center pt-6 space-x-4 no-print">
           <button onClick={() => { resetHome(); setTranslatedPlan(null); }} className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center space-x-2"><Icons.Back /> <span>{t.common.back}</span></button>
        </div>
      </div>
    );
  };

  // ... (rest of the component logic for sections like renderDiabeticDiet, renderPreDiabeticDiet, etc. remains same)
  // I will just return the full component with the new additions in renderHome and the helper functions

  const renderDiabeticDiet = () => (
      <div className="max-w-xl mx-auto w-full pt-10 px-4 pb-20">
        <SectionAnimation type="diabetic" />
        <LiveAnimation type="diabetic" />
        <div className="flex items-center space-x-2 mb-8 justify-center">
          <button onClick={() => setSection(Section.HOME)} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50"><Icons.Back /></button>
          <h2 className="text-2xl font-black text-emerald-900">{t.sections.diabeticDiet}</h2>
        </div>
        <div className="space-y-6 animate-fade-scale">
           {dietStep === 0 && (
               <>
                  <h3 className="text-center font-bold text-slate-600 mb-4">{t.common.selectHba1c}</h3>
                  <div className="grid grid-cols-2 gap-4">
                      {['6.5-7', '7-8.5', '8.5-10', '>10'].map((val) => (<SelectionCard key={val} label={val === '>10' ? '> 10%' : `${val}%`} selected={ddHba1c === val} onClick={() => { setDdHba1c(val as Hba1cLevel); setDietStep(1); }} activeColorClass="bg-emerald-500" />))}
                  </div>
               </>
           )}
           {dietStep === 1 && (
               <>
                  <h3 className="text-center font-bold text-slate-600 mb-4">{t.common.selectDiet}</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <SelectionCard label={t.common.veg} icon="🥦" selected={ddDiet === 'Veg'} onClick={() => { setDdDiet('Veg'); setDietStep(2); }} activeColorClass="bg-green-500" />
                      <SelectionCard label={t.common.nonVeg} icon="🍗" selected={ddDiet === 'NonVeg'} onClick={() => { setDdDiet('NonVeg'); setDietStep(2); }} activeColorClass="bg-red-500" />
                  </div>
               </>
           )}
           {dietStep === 2 && (
               <>
                  <h3 className="text-center font-bold text-slate-600 mb-4">{t.common.selectExercise}</h3>
                  <div className="space-y-4">
                      <SelectionCard label={t.common.none} selected={ddExercise === 'None'} onClick={() => { setDdExercise('None'); setDietStep(3); }} activeColorClass="bg-slate-500" />
                      <SelectionCard label={t.common.cardio} selected={ddExercise === '30minCardio'} onClick={() => { setDdExercise('30minCardio'); setDietStep(3); }} activeColorClass="bg-blue-500" />
                  </div>
               </>
           )}
           {dietStep === 3 && ddHba1c && ddDiet && ddExercise && (
               <div className="animate-fade-scale">
                    <div className="mb-4 text-center"><button onClick={() => { setDietStep(0); setTranslatedPlan(null); }} className="text-xs text-emerald-600 underline">Change Selections</button></div>
                    {renderChart(getDietPlan(ddHba1c, ddDiet, ddExercise, lang))}
               </div>
           )}
        </div>
      </div>
  );

  const renderPreDiabeticDiet = () => (
    <div className="max-w-xl mx-auto w-full pt-10 px-4 pb-20">
      <SectionAnimation type="diabetic" />
      <LiveAnimation type="pre-diabetic" />
      <div className="flex items-center space-x-2 mb-8 justify-center">
        <button onClick={() => setSection(Section.HOME)} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50"><Icons.Back /></button>
        <h2 className="text-2xl font-black text-teal-900">{t.sections.preDiabeticDiet}</h2>
      </div>
      <div className="space-y-6 animate-fade-scale">
         {preDietStep === 0 && (
             <>
                <h3 className="text-center font-bold text-slate-600 mb-4">{t.common.selectDiet}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <SelectionCard label={t.common.veg} icon="🥦" selected={pdDiet === 'Veg'} onClick={() => { setPdDiet('Veg'); setPreDietStep(1); }} activeColorClass="bg-green-500" />
                    <SelectionCard label={t.common.nonVeg} icon="🍗" selected={pdDiet === 'NonVeg'} onClick={() => { setPdDiet('NonVeg'); setPreDietStep(1); }} activeColorClass="bg-red-500" />
                </div>
             </>
         )}
         {preDietStep === 1 && (
             <>
                <h3 className="text-center font-bold text-slate-600 mb-4">{t.common.selectExercise}</h3>
                <div className="space-y-4">
                    <SelectionCard label={t.common.none} selected={pdExercise === 'None'} onClick={() => { setPdExercise('None'); setPreDietStep(2); }} activeColorClass="bg-slate-500" />
                    <SelectionCard label={t.common.cardio} selected={pdExercise === '30minCardio'} onClick={() => { setPdExercise('30minCardio'); setPreDietStep(2); }} activeColorClass="bg-blue-500" />
                </div>
             </>
         )}
         {preDietStep === 2 && pdDiet && pdExercise && (
             <div className="animate-fade-scale">
                  <div className="mb-4 text-center"><button onClick={() => { setPreDietStep(0); setTranslatedPlan(null); }} className="text-xs text-teal-600 underline">Change Selections</button></div>
                  {renderChart(getPreDiabeticDietPlan(pdDiet, pdExercise, lang))}
             </div>
         )}
      </div>
    </div>
  );

  const renderGdmDiet = () => (
    <div className="max-w-xl mx-auto w-full pt-10 px-4 pb-20">
      <SectionAnimation type="pregnant" />
      <LiveAnimation type="gdm" />
      <div className="flex items-center space-x-2 mb-8 justify-center">
        <button onClick={() => { setSection(Section.HOME); setGdmStep(0); }} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50"><Icons.Back /></button>
        <h2 className="text-2xl font-black text-rose-900">{t.sections.gdmDiet}</h2>
      </div>
      <div className="space-y-6 animate-fade-scale">
        {gdmStep === 0 && (
           <>
              <h3 className="text-center font-bold text-slate-600 mb-4">{t.common.selectTrimester}</h3>
              <div className="grid gap-4">
                  <SelectionCard label={t.trimesters.t1} selected={gdmTrimester === '1'} onClick={() => { setGdmTrimester('1'); setGdmStep(1); }} activeColorClass="bg-rose-400" />
                  <SelectionCard label={t.trimesters.t2} selected={gdmTrimester === '2'} onClick={() => { setGdmTrimester('2'); setGdmStep(1); }} activeColorClass="bg-rose-500" />
                  <SelectionCard label={t.trimesters.t3} selected={gdmTrimester === '3'} onClick={() => { setGdmTrimester('3'); setGdmStep(1); }} activeColorClass="bg-rose-600" />
              </div>
           </>
        )}
        {gdmStep === 1 && (
           <>
              <h3 className="text-center font-bold text-slate-600 mb-4">{t.common.selectHba1c}</h3>
              <div className="grid grid-cols-2 gap-4">
                  {['6.5-7', '7-8.5', '8.5-10', '>10'].map((val) => (<SelectionCard key={val} label={val === '>10' ? '> 10%' : `${val}%`} selected={gdmHba1c === val} onClick={() => { setGdmHba1c(val as Hba1cLevel); setGdmStep(2); }} activeColorClass="bg-rose-500" />))}
              </div>
           </>
        )}
        {gdmStep === 2 && (
           <>
              <h3 className="text-center font-bold text-slate-600 mb-4">{t.common.selectDiet}</h3>
              <div className="grid grid-cols-2 gap-4">
                  <SelectionCard label={t.common.veg} icon="🥦" selected={gdmDiet === 'Veg'} onClick={() => { setGdmDiet('Veg'); setGdmStep(3); }} activeColorClass="bg-green-500" />
                  <SelectionCard label={t.common.nonVeg} icon="🍗" selected={gdmDiet === 'NonVeg'} onClick={() => { setGdmDiet('NonVeg'); setGdmStep(3); }} activeColorClass="bg-red-500" />
              </div>
           </>
        )}
        {gdmStep === 3 && (
           <>
              <h3 className="text-center font-bold text-slate-600 mb-4">{t.common.selectExercise}</h3>
              <div className="space-y-4">
                  <SelectionCard label={t.common.none} selected={gdmExercise === 'None'} onClick={() => { setGdmExercise('None'); setGdmStep(4); }} activeColorClass="bg-slate-500" />
                  <SelectionCard label={t.common.cardio} selected={gdmExercise === '30minCardio'} onClick={() => { setGdmExercise('30minCardio'); setGdmStep(4); }} activeColorClass="bg-blue-500" />
              </div>
           </>
        )}
        {gdmStep === 4 && gdmTrimester && gdmHba1c && gdmDiet && gdmExercise && (
            <div className="animate-fade-scale">
                <div className="mb-4 text-center"><button onClick={() => { setGdmStep(0); setTranslatedPlan(null); }} className="text-xs text-rose-600 underline">Change Selection</button></div>
                {renderChart(getGdmDietPlan(gdmHba1c, gdmTrimester, gdmDiet, gdmExercise, lang))} 
            </div>
        )}
      </div>
    </div>
  );

  const renderPatientData = () => (
    <div className="max-w-xl mx-auto w-full pt-10 px-4 pb-20">
      <SectionAnimation type="patient" />
      <div className="flex justify-center mb-6"><LiveAnimation type="patient" /></div>
      <div className="flex items-center space-x-2 mb-8 justify-center relative">
        <button onClick={() => setSection(Section.HOME)} className="absolute left-0 p-2 bg-white rounded-full shadow-sm hover:bg-slate-50"><Icons.Back /></button>
        <h2 className="text-2xl font-black text-blue-900">{t.sections.patientData}</h2>
      </div>
      
      <div className="bg-white/60 backdrop-blur-xl p-1 rounded-2xl flex mb-6 shadow-inner border border-white/40">
          <button onClick={() => setPatientTab('NEW')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${patientTab === 'NEW' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>{t.patient.newPatient}</button>
          <button onClick={() => setPatientTab('EXISTING')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${patientTab === 'EXISTING' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>{t.patient.oldPatient}</button>
      </div>

      {patientTab === 'NEW' ? (
          <div className="bg-white/80 p-6 rounded-3xl border border-white/60 shadow-xl space-y-4 animate-fade-scale">
              <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Name</label><input name="name" value={patientForm.name} onChange={handlePatientChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Full Name" /></div>
              <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Age</label><input name="age" value={patientForm.age} onChange={handlePatientChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" placeholder="Years" /></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Weight</label><input name="weight" value={patientForm.weight} onChange={handlePatientChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" placeholder="kg" /></div>
              </div>
              <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">History / KCO</label><textarea name="kco" value={patientForm.kco} onChange={handlePatientChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 h-20" placeholder="Known cases (HTN, etc.)" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Diagnosis</label><input name="diagnosis" value={patientForm.diagnosis} onChange={handlePatientChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" placeholder="Current Diagnosis" /></div>
              <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase">RBS</label><input name="rbs" value={patientForm.rbs} onChange={handlePatientChange} className="w-full p-2 rounded-lg bg-slate-50 border" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase">PP</label><input name="pp" value={patientForm.pp} onChange={handlePatientChange} className="w-full p-2 rounded-lg bg-slate-50 border" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase">HbA1c</label><input name="hba1c" value={patientForm.hba1c} onChange={handlePatientChange} className="w-full p-2 rounded-lg bg-slate-50 border" /></div>
              </div>
              <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Old Medication</label><input name="medOld" value={patientForm.medOld} onChange={handlePatientChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" placeholder="Previous meds" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">New Medication</label><input name="medNew" value={patientForm.medNew} onChange={handlePatientChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" placeholder="Prescribed meds" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Follow-up</label><input name="dosage" value={patientForm.dosage} onChange={handlePatientChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" placeholder="Date / Instructions" /></div>
              
              <button onClick={savePatient} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors flex justify-center items-center space-x-2">
                 {isSyncing ? <span>Saving...</span> : <span>Save Record</span>}
              </button>
          </div>
      ) : (
          <div className="space-y-4 animate-fade-scale">
              <div className="flex justify-end no-print"><button onClick={() => window.print()} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-200 transition-colors flex items-center gap-2"><Icons.Print /> Print List</button></div>
              {existingPatients.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h4 className="font-bold text-slate-800 text-lg">{p.name} <span className="text-xs font-normal text-slate-500">({p.age}y, {p.weight}kg)</span></h4>
                              <p className="text-xs text-blue-600 font-medium">{p.diagnosis}</p>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{p.dateAdded}</span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <p><span className="font-bold">History:</span> {p.history}</p>
                          <div className="flex gap-4">
                              <span><span className="font-bold">HbA1c:</span> {p.bloodGlucose.hba1c}%</span>
                              <span><span className="font-bold">RBS:</span> {p.bloodGlucose.rbs}</span>
                          </div>
                          <p className="pt-1 border-t border-slate-200 mt-1"><span className="font-bold text-emerald-600">New Rx:</span> {p.medication.new}</p>
                      </div>
                  </div>
              ))}
              {existingPatients.length === 0 && <div className="text-center text-slate-400 py-10 bg-white rounded-2xl border border-dashed border-slate-200">No records found.</div>}
          </div>
      )}
    </div>
  );

  const renderExercise = () => (
    <div className="max-w-xl mx-auto w-full pt-10 px-4 pb-20">
      <SectionAnimation type="exercise" />
      <div className="flex justify-center mb-6"><LiveAnimation type="patient" /></div>
      <div className="flex items-center space-x-2 mb-8 justify-center relative">
        <button onClick={() => setSection(Section.HOME)} className="absolute left-0 p-2 bg-white rounded-full shadow-sm hover:bg-slate-50"><Icons.Back /></button>
        <h2 className="text-2xl font-black text-indigo-900">{t.sections.exercise}</h2>
      </div>
      
      <div className="grid gap-4 animate-fade-scale">
         <div onClick={() => window.open('https://youtu.be/Wkzm5K_g6_E', '_blank')} className="cursor-pointer bg-white/80 p-5 rounded-2xl shadow-sm border border-white/50 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-4">
             <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 shrink-0"><Icons.Exercise /></div>
             <div><h3 className="font-bold text-slate-800">Diabetic Exercise</h3><p className="text-xs text-slate-500">Specialized routine for glucose control.</p></div>
         </div>
         <div onClick={() => window.open('https://youtu.be/Qymarl8FyEk', '_blank')} className="cursor-pointer bg-white/80 p-5 rounded-2xl shadow-sm border border-white/50 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-4">
             <div className="p-3 bg-teal-100 rounded-full text-teal-600 shrink-0"><span className="material-icons-outlined">fitness_center</span></div>
             <div><h3 className="font-bold text-slate-800">Weight Loss</h3><p className="text-xs text-slate-500">Effective fat burning exercises.</p></div>
         </div>
         <div onClick={() => window.open('https://youtu.be/kfnSIYBjZK8', '_blank')} className="cursor-pointer bg-white/80 p-5 rounded-2xl shadow-sm border border-white/50 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-4">
             <div className="p-3 bg-rose-100 rounded-full text-rose-600 shrink-0"><span className="material-icons-outlined">accessibility_new</span></div>
             <div><h3 className="font-bold text-slate-800">Cervical Spondylosis</h3><p className="text-xs text-slate-500">Neck pain relief and strengthening.</p></div>
         </div>
         <div onClick={() => window.open('https://youtu.be/-Lv3GRg02io', '_blank')} className="cursor-pointer bg-white/80 p-5 rounded-2xl shadow-sm border border-white/50 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-4">
             <div className="p-3 bg-orange-100 rounded-full text-orange-600 shrink-0"><span className="material-icons-outlined">self_improvement</span></div>
             <div><h3 className="font-bold text-slate-800">Lumbar Spondylosis</h3><p className="text-xs text-slate-500">Lower back strengthening exercises.</p></div>
         </div>
      </div>
    </div>
  );

  const renderNutrients = () => (
     <div className="max-w-xl mx-auto w-full pt-10 px-4 pb-20">
      <SectionAnimation type="diabetic" />
      <div className="flex justify-center mb-6"><LiveAnimation type="diabetic" /></div>
      <div className="flex items-center space-x-2 mb-8 justify-center relative">
        <button onClick={() => setSection(Section.HOME)} className="absolute left-0 p-2 bg-white rounded-full shadow-sm hover:bg-slate-50"><Icons.Back /></button>
        <h2 className="text-2xl font-black text-violet-900">{t.sections.dailyNutrients}</h2>
      </div>

      <div className="bg-slate-200/50 p-1 rounded-2xl flex mb-6 mx-auto max-w-sm">
          <button onClick={() => setNutrientTab('MACRO')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${nutrientTab === 'MACRO' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500'}`}>Macronutrients</button>
          <button onClick={() => setNutrientTab('MICRO')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${nutrientTab === 'MICRO' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500'}`}>Micronutrients</button>
      </div>

      {nutrientTab === 'MACRO' && (
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-xl space-y-6 animate-fade-scale">
               <div>
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1">Weight (kg)</label>
                   <input type="number" value={macroWeight} onChange={(e) => setMacroWeight(e.target.value)} className="w-full p-4 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-violet-200 outline-none text-xl font-bold" placeholder="0" />
               </div>
               <div>
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Activity Level</label>
                   <div className="grid grid-cols-3 gap-2">
                       {['Sedentary', 'Moderate', 'Active'].map((lvl) => (
                           <button key={lvl} onClick={() => setMacroActivity(lvl as ActivityLevel)} className={`py-2 rounded-lg text-xs font-bold border transition-all ${macroActivity === lvl ? 'bg-violet-100 border-violet-200 text-violet-700' : 'bg-white border-slate-100 text-slate-500'}`}>
                               {lvl}
                           </button>
                       ))}
                   </div>
               </div>
               <button onClick={calculateMacro} className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold shadow-lg hover:bg-violet-700 transition-colors">Calculate Needs</button>
               {macroResult && (
                   <div className="bg-white p-6 rounded-2xl border border-violet-100 shadow-sm space-y-4">
                       <div className="text-center">
                           <div className="text-3xl font-black text-violet-600">{macroResult.cal}</div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Calories</div>
                       </div>
                       <div className="grid grid-cols-3 gap-2 text-center">
                           <div className="bg-green-50 p-2 rounded-xl border border-green-100"><div className="font-black text-green-700">{macroResult.pro}g</div><div className="text-[10px] text-green-500 font-bold uppercase">Protein</div></div>
                           <div className="bg-blue-50 p-2 rounded-xl border border-blue-100"><div className="font-black text-blue-700">{macroResult.carbs}g</div><div className="text-[10px] text-blue-500 font-bold uppercase">Carbs</div></div>
                           <div className="bg-orange-50 p-2 rounded-xl border border-orange-100"><div className="font-black text-orange-700">{macroResult.fat}g</div><div className="text-[10px] text-orange-500 font-bold uppercase">Fats</div></div>
                       </div>
                       <p className="text-[10px] text-center text-slate-400">Protein calculated at 0.81g per kg body weight.</p>
                   </div>
               )}
          </div>
      )}

      {nutrientTab === 'MICRO' && (
          <div className="space-y-6 animate-fade-scale">
               <div className="bg-white/80 p-6 rounded-3xl shadow-lg border border-white/50">
                   <h3 className="font-bold text-lg text-slate-800 mb-2">Essential Micronutrients</h3>
                   <div className="p-3 bg-violet-50 rounded-xl text-xs font-medium text-violet-800 mb-4 border border-violet-100 flex items-center gap-2">
                       <span className="material-icons-outlined text-sm">info</span> Helps in Prevention of Diabetes & Management
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-xs text-left">
                           <thead><tr className="border-b border-slate-200 text-slate-400 uppercase"><th className="py-2">Nutrient</th><th className="py-2">Target</th><th className="py-2">Sources</th></tr></thead>
                           <tbody className="text-slate-700 font-medium">
                               {[
                                   ['Copper (Cu)', '0.9 mg', 'Nuts, seeds, grains'],
                                   ['Chromium (Cr)', '20–35 µg', 'Broccoli, grains, bajra'],
                                   ['Cobalt (B12)', '2.4 µg', 'Dairy, fortified foods'],
                                   ['Magnesium (Mg)', '320–450 mg', 'Ragi, nuts, greens'],
                                   ['Manganese (Mn)', '1.8–2.3 mg', 'Whole grains, veg'],
                                   ['Selenium (Se)', '55 µg', 'Seeds, grains'],
                                   ['Zinc (Zn)', '10–12 mg', 'Legumes, dairy'],
                                   ['Vanadium (V)', 'Trace', '-']
                               ].map(([n, t, s], i) => (
                                   <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50"><td className="py-2 pr-2">{n}</td><td className="py-2 pr-2 text-violet-600 font-bold whitespace-nowrap">{t}</td><td className="py-2">{s}</td></tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
               
               <div className="grid gap-4">
                   <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
                       <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wider mb-2">High Price (Better Quality)</h4>
                       <div className="flex gap-2 flex-wrap">
                           {['Centrum', 'Swiss'].map(b => <span key={b} className="px-3 py-1 bg-white text-amber-900 rounded-full text-xs font-bold shadow-sm border border-amber-200">{b}</span>)}
                       </div>
                   </div>
                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
                       <h4 className="font-bold text-blue-800 text-sm uppercase tracking-wider mb-2">Low Price (Fair Quality)</h4>
                       <div className="flex gap-2 flex-wrap">
                           {['Supradyn', 'Zincovit', 'Becapsule'].map(b => <span key={b} className="px-3 py-1 bg-white text-blue-900 rounded-full text-xs font-bold shadow-sm border border-blue-200">{b}</span>)}
                       </div>
                   </div>
               </div>
          </div>
      )}
     </div>
  );

  const renderPediatricDiet = () => {
    return (
        <div className="max-w-xl mx-auto w-full pt-10 px-4 pb-20">
            <SectionAnimation type="pediatric" />
            <div className="flex items-center space-x-2 mb-8 justify-center relative">
                <button onClick={() => { setPediatricStep(0); setSection(Section.HOME); setTranslatedPlan(null); }} className="absolute left-0 p-2 bg-white rounded-full shadow-sm hover:bg-slate-50"><Icons.Back /></button>
                <h2 className="text-2xl font-black text-cyan-900">{t.sections.pediatricDiet}</h2>
            </div>
            
            <ThreeDTabs activeTab={pediatricTab} onTabChange={setPediatricTab} t={t} />

            {pediatricTab === 'DIET' && (
                <div className="space-y-6 animate-fade-scale">
                    {pediatricStep === 0 && (
                        <>
                            <div className="flex justify-center mb-4"><LiveAnimation type="pediatric" subType="6m" /></div>
                            <h3 className="text-center font-bold text-slate-600 mb-4">{t.pediatric.selectAge}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2 perspective-container pb-4">
                                {['0-6m', '6-12m', '1-3y', '4-6y', '7-9y'].map((age, i) => {
                                    const labels: Record<string, string> = { '0-6m': 'Infant', '6-12m': 'Baby', '1-3y': 'Toddler', '4-6y': 'Preschool', '7-9y': 'School' };
                                    const emojis: Record<string, string> = { '0-6m': '🍼', '6-12m': '🥣', '1-3y': '🧸', '4-6y': '🪁', '7-9y': '🎒' };
                                    const colors = ['pink', 'cyan', 'yellow', 'green', 'purple'];
                                    return (
                                        <div key={age} onClick={() => { setPedAge(age as PediatricAgeGroup); setPediatricStep(1); }} className={`w-full h-32 bg-gradient-to-r from-${colors[i]}-100 to-${colors[i]}-50 rounded-3xl p-4 flex flex-row items-center justify-between border-2 border-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer card-3d relative group overflow-hidden`}>
                                            <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${colors[i]}-400`}></div>
                                            <div className="flex flex-col ml-4">
                                                <span className="font-black text-slate-700 text-xl card-content-3d">{labels[age]}</span>
                                                <span className="text-xs font-bold text-slate-500 mt-1 bg-white/60 px-2 py-0.5 rounded-full w-fit">{age}</span>
                                            </div>
                                            <span className="text-5xl mr-4 card-icon-3d drop-shadow-md group-hover:scale-110 transition-transform">{emojis[age]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                    {pediatricStep === 1 && pedAge === '6-12m' && !pedSubAge && (
                         <>
                            <h3 className="text-center font-bold text-slate-600 mb-4">{t.pediatric.selectSubAge}</h3>
                            <div className="grid gap-4">
                                <SelectionCard label="6-8 Months" selected={pedSubAge === '6-8m'} onClick={() => { setPedSubAge('6-8m'); setPediatricStep(2); }} activeColorClass="bg-cyan-500" />
                                <SelectionCard label="9-12 Months" selected={pedSubAge === '9-12m'} onClick={() => { setPedSubAge('9-12m'); setPediatricStep(2); }} activeColorClass="bg-cyan-500" />
                            </div>
                         </>
                    )}
                    {((pediatricStep >= 1 && pedAge !== '6-12m') || (pediatricStep >= 2 && pedSubAge)) && (
                        <div className="animate-fade-scale">
                             <div className="mb-4 text-center"><button onClick={() => { setPediatricStep(0); setPedSubAge(null); setTranslatedPlan(null); }} className="text-xs text-cyan-600 underline hover:text-cyan-800 transition-colors">Change Age Group</button></div>
                             {renderChart(getPediatricDietPlan(pedAge!, pedSubAge, lang))}
                        </div>
                    )}
                </div>
            )}
            
            {pediatricTab === 'GROWTH' && (
                <div className="space-y-6 animate-fade-scale no-print">
                    <div className="flex justify-center mb-2"><LiveAnimation type="pediatric" subType="4-6y" /></div>
                    <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/60 space-y-8 relative overflow-visible">
                        <GenderToggle value={growthGender} onChange={setGrowthGender} />
                        <div className="bg-white/60 p-6 rounded-3xl border border-slate-100 shadow-inner space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age (Years)</span><span className="px-3 py-1 bg-white shadow-sm rounded-lg font-black text-slate-700">{growthYears}</span></div>
                                <input type="range" min="0" max="9" value={growthYears} onChange={(e) => setGrowthYears(parseInt(e.target.value))} className="w-full h-4 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600 shadow-inner hover:bg-slate-300 transition-colors" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age (Months)</span><span className="px-3 py-1 bg-white shadow-sm rounded-lg font-black text-slate-700">{growthMonths}</span></div>
                                <input type="range" min="0" max="11" value={growthMonths} onChange={(e) => setGrowthMonths(parseInt(e.target.value))} className="w-full h-4 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600 shadow-inner hover:bg-slate-300 transition-colors" />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border-l-4 border-cyan-500 shadow-lg transform hover:scale-[1.02] transition-transform">
                            <label className="text-[10px] font-bold text-cyan-600 uppercase mb-1 block">Current Weight</label>
                            <input type="number" value={growthWeight} onChange={e => setGrowthWeight(e.target.value)} className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none placeholder:text-slate-300" placeholder="kg" />
                        </div>
                        <WeightZones gender={growthGender} years={growthYears} months={growthMonths} />
                        <button onClick={calculateGrowth} disabled={!growthWeight} className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-200 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center relative overflow-hidden group">
                            <span className="material-icons-outlined mr-2 animate-bounce">analytics</span> Assess Growth
                        </button>
                    </div>
                    {growthResult && (
                        <div id="growth-result" className="mt-8 animate-slide-up bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-full h-2 bg-${growthResult.color}-500`}></div>
                            <div className="text-center mb-6">
                                <h4 className={`text-3xl font-black mb-1`} style={{ color: growthResult.color === 'green' ? '#10b981' : growthResult.color === 'orange' ? '#f97316' : '#ef4444' }}>{growthResult.status}</h4>
                                <p className="text-slate-500 font-medium text-sm">Child is at the <span className="font-bold text-slate-800">{Math.round(growthResult.percentile)}th percentile</span></p>
                            </div>
                            <div className="text-center mt-4">
                                <button onClick={() => setShowFullWhoChart(!showFullWhoChart)} className="text-xs text-blue-600 underline font-bold">
                                    {showFullWhoChart ? "Hide Detailed WHO Table" : "Show Detailed WHO Table"}
                                </button>
                            </div>
                            {showFullWhoChart && (
                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-[10px] text-left border-collapse">
                                        <thead><tr className="bg-slate-100"><th className="p-2 border">Age (Mo)</th><th className="p-2 border">3rd</th><th className="p-2 border">15th</th><th className="p-2 border">50th</th><th className="p-2 border">85th</th><th className="p-2 border">97th</th></tr></thead>
                                        <tbody>
                                            {Object.entries(growthGender === 'Boy' ? WHO_DATA.boys : WHO_DATA.girls).map(([age, vals]: any) => (
                                                <tr key={age} className={parseInt(age) === (growthYears * 12 + growthMonths) ? "bg-yellow-50 border-2 border-yellow-200" : ""}>
                                                    <td className="p-2 border font-bold">{age}</td>
                                                    {vals.map((v: number, i: number) => <td key={i} className="p-2 border">{v}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
  };

  const getBackgroundClass = () => {
    if (section === Section.HOME) {
      switch (hoveredColor) {
        case 'emerald': return 'from-emerald-50 to-emerald-100';
        case 'teal': return 'from-teal-50 to-teal-100';
        case 'rose': return 'from-rose-50 to-rose-100';
        case 'cyan': return 'from-cyan-50 to-cyan-100';
        case 'blue': return 'from-blue-50 to-blue-100';
        case 'indigo': return 'from-indigo-50 to-indigo-100';
        case 'violet': return 'from-violet-50 to-violet-100';
        default: return 'from-slate-50 to-gray-100';
      }
    }
    
    switch (section) {
      case Section.DIABETIC_DIET: return 'from-emerald-50 to-teal-100';
      case Section.PRE_DIABETIC_DIET: return 'from-teal-50 to-cyan-100';
      case Section.GDM_DIET: return 'from-rose-50 to-pink-100';
      case Section.PEDIATRIC_DIET: return 'from-cyan-50 to-blue-100';
      case Section.PATIENT_DATA: return 'from-blue-50 to-indigo-100';
      case Section.EXERCISE: return 'from-indigo-50 to-violet-100';
      case Section.DAILY_NUTRIENTS: return 'from-violet-50 to-purple-100';
      default: return 'from-slate-50 to-gray-100';
    }
  };

  const renderIntro = () => (
    <div className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-1000 ${showIntro ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {isOrbiting && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><OrbitLogo /></div>}
      <div className="text-center animate-float-3d perspective-[1000px] relative z-10 mt-64">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 font-sans text-3d-bold">MADHUSPARSH</h1>
        <div className="animate-float space-y-1"><p className="text-xl font-bold tracking-widest uppercase mb-1 text-slate-900">By Dr.Saurabh</p></div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${getBackgroundClass()} transition-colors duration-1000`}>
      {renderIntro()}
      {renderHeader()}
      <main className="container mx-auto pb-10 flex-grow">
        {section === Section.HOME && renderHome()}
        {section === Section.DIABETIC_DIET && renderDiabeticDiet()}
        {section === Section.PRE_DIABETIC_DIET && renderPreDiabeticDiet()}
        {section === Section.GDM_DIET && renderGdmDiet()}
        {section === Section.PEDIATRIC_DIET && renderPediatricDiet()}
        {section === Section.PATIENT_DATA && renderPatientData()}
        {section === Section.EXERCISE && renderExercise()}
        {section === Section.DAILY_NUTRIENTS && renderNutrients()}
      </main>
      <footer className="w-full py-8 text-center text-slate-600 text-sm bg-white/30 backdrop-blur-md border-t border-white/40 mt-auto no-print relative z-10">
        <div className="container mx-auto px-4"><p className="font-black text-slate-700 tracking-wide">MADHUSPARSH © {new Date().getFullYear()}</p><p className="text-xs font-medium text-slate-500">Dr. Saurabh • Diabetic Care</p></div>
      </footer>
    </div>
  );
};
