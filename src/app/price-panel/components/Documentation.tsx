"use client";

import React, { useState } from 'react';
import { FaCode, FaRobot, FaGitAlt, FaDesktop } from 'react-icons/fa';

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('web');

  const tabs = [
    { id: 'web', label: 'Architecture Web', icon: <FaCode /> },
    { id: 'bot', label: 'Données Bot', icon: <FaRobot /> },
    { id: 'git', label: 'Secours Git', icon: <FaGitAlt /> },
    { id: 'app', label: 'Futur App', icon: <FaDesktop /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Documentation Technique</h2>
          <p className="text-purple-300/60">Guides et ressources pour le développement.</p>
        </div>
      </div>

      <div className="bg-[#0f1016] rounded-xl p-1.5 border border-purple-500/20 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 font-medium ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-transparent text-purple-400/60 hover:text-white hover:bg-purple-500/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-purple-900/10 rounded-xl border border-purple-500/20 overflow-hidden p-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-purple-200/80 space-y-6">
        {activeTab === 'web' && (
          <div className="prose prose-invert max-w-none prose-p:text-purple-200/80 prose-headings:text-white prose-li:text-purple-200/80 prose-strong:text-purple-300">
            <h2 className="text-2xl font-bold text-white mb-4">GigaPrice - Architecture Web</h2>
            <p>Documentation technique du site Next.js actuel.</p>
            
            <h3 className="text-xl font-bold text-white mt-6 mb-2">Stack Technique</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Framework :</strong> Next.js 16.1.1 (App Router)</li>
              <li><strong>Moteur UI :</strong> React 19</li>
              <li><strong>Langage :</strong> TypeScript</li>
              <li><strong>Styles :</strong> Tailwind CSS (via globals.css)</li>
              <li><strong>Auth :</strong> Supabase Auth (Discord)</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-6 mb-2">Structure des Dossiers</h3>
            <ul className="list-disc pl-5 space-y-1 font-mono text-sm bg-[#13141f] p-4 rounded-lg border border-purple-500/20 text-purple-300/90">
              <li>src/app/(site) : Pages publiques (Layout global)</li>
              <li>src/app/price-panel : Dashboard Admin (Layout isolé)</li>
              <li>src/components : Composants réutilisables</li>
              <li>src/lib : Utilitaires (Supabase client)</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-6 mb-2">Déploiement Hostinger</h3>
            <p>Le site est déployé en <strong>Export Statique</strong>.</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Build : <code className="bg-purple-900/30 px-1 rounded text-purple-300">npm run build:static</code> (Génère le dossier <code>out</code>)</li>
              <li>Zip : <code className="bg-purple-900/30 px-1 rounded text-purple-300">npm run zip</code> (Crée <code>gigaprice_static.zip</code> compatible Linux)</li>
              <li>Upload : Déposer le ZIP dans le File Manager Hostinger (public_html)</li>
            </ol>
          </div>
        )}

        {activeTab === 'bot' && (
          <div className="prose prose-invert max-w-none prose-p:text-purple-200/80 prose-headings:text-white prose-li:text-purple-200/80 prose-strong:text-purple-300">
            <h2 className="text-2xl font-bold text-white mb-4">Spécifications Bot & Base de Données</h2>
            <p>Guide pour le développement du Bot Discord et du Scraper.</p>

            <h3 className="text-xl font-bold text-white mt-6 mb-2">1. Configs PC (JSONB)</h3>
            <pre className="bg-[#13141f] p-4 rounded-lg overflow-x-auto text-sm border border-purple-500/20 text-purple-300/90">
{`{
  "os": "Windows 10 64-bit",
  "processor": "Intel Core i5...",
  "memory": "8 GB RAM",
  "graphics": "NVIDIA GTX 1060...",
  "storage": "70 GB available"
}`}
            </pre>
            
            <h3 className="text-xl font-bold text-white mt-6 mb-2">2. Tags & Recommandations</h3>
            <p>Le bot doit scraper les tags Steam (ex: &quot;Souls-like&quot;, &quot;RPG&quot;).</p>
            <p className="text-sm bg-blue-900/20 p-3 rounded border border-blue-500/30 text-blue-200">
              <strong>Table Games :</strong> Colonne <code>tags</code> (TEXT[])
            </p>

            <h3 className="text-xl font-bold text-white mt-6 mb-2">3. Tracking Utilisateur</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Table anonymous_users :</strong> ID visiteur (Cookie UUID)</li>
              <li><strong>Table game_views :</strong> Historique des vues pour l&apos;algo de recommandation</li>
            </ul>
          </div>
        )}

        {activeTab === 'git' && (
          <div className="prose prose-invert max-w-none prose-p:text-purple-200/80 prose-headings:text-white prose-li:text-purple-200/80 prose-strong:text-purple-300">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Procédure de Secours Git</h2>
            <p className="bg-red-900/10 p-4 rounded border border-red-500/20 text-red-300">
              À utiliser uniquement si la synchro Git est cassée et que le local est la source de vérité.
            </p>

            <h3 className="text-xl font-bold text-white mt-6 mb-2">Commandes de Force Push</h3>
            <pre className="bg-[#13141f] p-4 rounded-lg overflow-x-auto text-sm font-mono text-green-400 border border-purple-500/20">
{`git init
git checkout -b main
git remote add origin https://github.com/matteohrq3842-stack/GigaPricevmax
git add .
git commit -m "reset: force sync"
git push -f origin main`}
            </pre>
          </div>
        )}

        {activeTab === 'app' && (
          <div className="prose prose-invert max-w-none prose-p:text-purple-200/80 prose-headings:text-white prose-li:text-purple-200/80 prose-strong:text-purple-300">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Vision : GigaPrice Desktop App</h2>
            <p>Roadmap pour l&apos;application Windows (Horizon Sept 2026).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                <h4 className="font-bold text-white mb-2">Pourquoi une App ?</h4>
                <ul className="list-disc pl-5 text-sm space-y-1 text-purple-200/80">
                  <li>Notifications Windows natives (Promos)</li>
                  <li>Lancement direct des jeux (Steam)</li>
                  <li>Toujours ouvert (System Tray)</li>
                </ul>
              </div>
              <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                <h4 className="font-bold text-white mb-2">Architecture</h4>
                <ul className="list-disc pl-5 text-sm space-y-1 text-purple-200/80">
                  <li><strong>Electron JS</strong> (Base Chrome)</li>
                  <li>Même Backend Supabase</li>
                  <li>Même Code React que le site</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mt-6 mb-2">Features &quot;Wow&quot;</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Auto-Activation :</strong> L&apos;app active la clé CD sur Steam automatiquement.</li>
              <li><strong>Auto-Installation :</strong> Lance le téléchargement Steam en un clic.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
