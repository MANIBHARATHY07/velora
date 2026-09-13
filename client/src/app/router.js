import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../shared/ui/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { VehiclesPage } from '../pages/VehiclesPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { ServiceHistoryPage } from '../pages/ServiceHistoryPage';
import { RemindersPage } from '../pages/RemindersPage';
import { CopilotPage } from '../pages/CopilotPage';
import { SettingsPage } from '../pages/SettingsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="service-history" element={<ServiceHistoryPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="copilot" element={<CopilotPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
