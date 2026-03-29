"use client";

import React from 'react';
import { AdminProvider } from './hooks/useAdmin';
import AdminShell from './components/core/AdminShell';

export default function PricePanelPage() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  );
}
