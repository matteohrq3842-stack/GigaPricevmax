"use client";

import React from 'react';
import Link from 'next/link';
import { FaExternalLinkAlt, FaFileContract, FaShieldAlt, FaCookie, FaInfoCircle } from 'react-icons/fa';

export default function LegalResources() {
  const resources = [
    {
      title: "Conditions Générales de Vente (CGV)",
      description: "Règles de vente, remboursement, et responsabilités.",
      path: "/cgv",
      icon: <FaFileContract className="text-blue-400" />
    },
    {
      title: "Conditions Générales d'Utilisation (CGU)",
      description: "Règles d'utilisation du site pour les visiteurs.",
      path: "/cgu", // Note: Need to check if this page exists, assuming yes or will act as placeholder
      icon: <FaInfoCircle className="text-purple-400" />
    },
    {
      title: "Politique de Confidentialité",
      description: "Gestion des données personnelles (RGPD).",
      path: "/privacy",
      icon: <FaShieldAlt className="text-green-400" />
    },
    {
      title: "Politique des Cookies",
      description: "Détail des cookies utilisés et consentement.",
      path: "/politique-cookies",
      icon: <FaCookie className="text-yellow-400" />
    },
    {
      title: "Mentions Légales",
      description: "Informations légales sur l'éditeur du site.",
      path: "/mentions-legales",
      icon: <FaInfoCircle className="text-gray-400" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {resources.map((resource, index) => (
        <div key={index} className="bg-purple-900/10 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-900/20 rounded-lg group-hover:bg-purple-900/40 transition-colors border border-purple-500/20">
              <span className="text-2xl">{resource.icon}</span>
            </div>
            <Link 
              href={resource.path} 
              target="_blank"
              className="text-purple-300/40 hover:text-white transition-colors"
            >
              <FaExternalLinkAlt />
            </Link>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{resource.title}</h3>
          <p className="text-purple-300/60 text-sm mb-4">{resource.description}</p>
          <div className="flex gap-2">
            <Link 
              href={resource.path}
              target="_blank"
              className="px-4 py-2 bg-purple-600/10 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-600 hover:text-white transition-colors border border-purple-500/20"
            >
              Voir la page
            </Link>
            <button className="px-4 py-2 bg-purple-900/20 text-purple-300/40 rounded-lg text-sm font-medium hover:bg-purple-900/40 hover:text-purple-200 transition-colors cursor-not-allowed border border-purple-500/10" title="Éditeur Bientôt Disponible">
              Éditer (Bientôt)
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
