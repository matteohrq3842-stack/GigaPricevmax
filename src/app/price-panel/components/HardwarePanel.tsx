"use client";

import React, { useState } from 'react';
import { FaDesktop, FaMicrochip, FaKeyboard, FaGamepad, FaTools } from 'react-icons/fa';
import HardwareDeals from './HardwareDeals';

export default function HardwarePanel({ initialTab = 'setup' }: { initialTab?: string }) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab);

  const tabs = [
    { id: 'setup', label: 'Setup PC', icon: <FaDesktop /> },
    { id: 'composants', label: 'Composants', icon: <FaMicrochip /> },
    { id: 'peripheriques', label: 'Périphériques', icon: <FaKeyboard /> },
    { id: 'consoles', label: 'Consoles', icon: <FaGamepad /> },
    { id: 'accessoires', label: 'Accessoires', icon: <FaTools /> },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="bg-[#0f1016] rounded-xl p-1.5 border border-purple-500/20 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 font-medium ${
              activeSubTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-transparent text-purple-400/60 hover:text-white hover:bg-purple-500/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        <HardwareDeals category={activeSubTab} />
      </div>
    </div>
  );
}
