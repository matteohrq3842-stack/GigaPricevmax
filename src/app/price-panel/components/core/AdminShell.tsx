"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGamepad, FaMicrochip, FaChartPie, FaCog, FaUsers, FaBars, FaBell } from 'react-icons/fa';
import { useAdmin } from '../../hooks/useAdmin';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/components/providers/SessionProvider';

import DashboardView from '../dashboard/DashboardView';
import DealsView from '../deals/DealsView';
import HardwareView from '../hardware/HardwareView';
import UsersView from './UsersView';
import SettingsView from './SettingsView';

export default function AdminShell() {
    const { isSidebarCollapsed, toggleSidebar, activeModule, setActiveModule, notifications } = useAdmin();
    const { user } = useAuth();
    const { roleIds } = useUserRoles();

    const menuItems = [
        { id: 'dashboard', label: 'Vue Global', icon: <FaChartPie /> },
        { id: 'deals', label: 'Jeux Vidéo', icon: <FaGamepad /> },
        { id: 'hardware', label: 'Hardware', icon: <FaMicrochip /> },
        { id: 'users', label: 'Utilisateurs', icon: <FaUsers /> },
        { id: 'settings', label: 'Paramètres', icon: <FaCog /> },
    ];

    const renderContent = () => {
        switch (activeModule) {
            case 'dashboard': return <DashboardView />;
            case 'deals': return <DealsView />;
            case 'hardware': return <HardwareView />;
            case 'settings': return <SettingsView />;
            case 'users': return <UsersView />;
            default: return <DashboardView />;
        }
    };

    return (
        <div className="flex h-screen bg-[#09090b] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarCollapsed ? 80 : 280 }}
                className="h-full bg-[#111116] border-r border-[#27272a] relative z-20 flex flex-col"
            >
                <div className="h-16 flex items-center px-6 border-b border-[#27272a]">
                    {/* Logo */}
                    <div className={`font-bold text-xl tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent truncate ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                        GigaPrice<span className="text-white/40 font-light">Admin</span>
                    </div>
                    {isSidebarCollapsed && <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">G</div>}
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveModule(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeModule === item.id
                                ? 'bg-gradient-to-r from-purple-600/20 to-transparent text-white shadow-[inset_2px_0_0_0_#a855f7]'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <div className={`text-xl transition-colors duration-300 ${activeModule === item.id ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-gray-500 group-hover:text-white'}`}>
                                {item.icon}
                            </div>
                            <span className={`whitespace-nowrap font-medium tracking-wide transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#27272a] bg-[#0c0c10]">
                    <div className="flex items-center gap-3">
                        {user?.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full border border-purple-500/30 shadow-lg object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold shadow-lg text-white">
                                {user?.email?.[0].toUpperCase() || 'A'}
                            </div>
                        )}

                        {!isSidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate">
                                    {/* Supabase Discord metadata mapping */}
                                    {user?.user_metadata?.custom_claims?.global_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    Role: Owner
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
                {/* Topbar */}
                <header className="h-16 border-b border-[#27272a] bg-[#111116]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <FaBars />
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button className="p-2 text-gray-400 hover:text-white relative">
                                <FaBell />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-[#27272a] scrollbar-track-transparent">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeModule}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-7xl mx-auto"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Toast Notifications */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`p-4 rounded-lg shadow-xl backdrop-blur-md border border-white/10 pointer-events-auto min-w-[300px] flex items-center gap-3 ${n.type === 'error' ? 'bg-red-500/10 text-red-200 border-red-500/20' :
                                n.type === 'success' ? 'bg-green-500/10 text-green-200 border-green-500/20' :
                                    'bg-[#1f1f26] text-gray-300'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${n.type === 'error' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                            <span className="text-sm font-medium">{n.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
