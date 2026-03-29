"use client";

import React from 'react';
import DealsTable from './DealsTable';

export default function DealsPanel() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Gestion des Jeux</h2>
                    <p className="text-purple-300/60">Liste des offres importées automatiquement ou manuellement.</p>
                </div>
                {/* Placeholder pour bouton Ajouter */}
                {/* <button className="px-4 py-2 bg-purple-600 rounded-lg text-white font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-500 transition-colors">
          + Ajouter un jeu
        </button> */}
            </div>

            <DealsTable />
        </div>
    );
}
