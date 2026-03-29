import React, { createContext, useContext, useState } from 'react';

interface AdminState {
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    activeModule: string;
    setActiveModule: (module: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    notifications: Notification[];
    addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: number;
}

const AdminContext = createContext<AdminState | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeModule, setActiveModule] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

    const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
        const id = Math.random().toString(36).substring(7);
        const notif = { id, type, message, timestamp: Date.now() };
        setNotifications(prev => [notif, ...prev]);

        // Auto dismiss
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    return (
        <AdminContext.Provider
            value={{
                isSidebarCollapsed,
                toggleSidebar,
                activeModule,
                setActiveModule,
                isLoading,
                setIsLoading,
                notifications,
                addNotification
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error("useAdmin must be used within AdminProvider");
    return context;
};
