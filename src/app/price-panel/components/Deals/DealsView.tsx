"use client";

import React from 'react';
import SmartDealsTable from './SmartDealsTable';

export default function DealsView() {
    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Gestion des Jeux</h2>
                    <p className="text-gray-400 mt-1">Gérez le catalogue des offres scannées par le bot.</p>
                </div>
                {/* <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg shadow-purple-900/20 transition-all">
          + Ajouter manuellement
        </button> */}
            </div>

            <SmartDealsTable />
        </div>
    );
}
