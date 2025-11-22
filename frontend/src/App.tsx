import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ThemeProvider } from './context/ThemeContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CasesListPage } from './pages/CasesListPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { ClientsListPage } from './pages/ClientsListPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { CreateCasePage } from './pages/CreateCasePage';
import { CreateClientPage } from './pages/CreateClientPage';
import { TasksListPage } from './pages/TasksListPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { CreateTaskPage } from './pages/CreateTaskPage';
import { EditCasePage } from './pages/EditCasePage';
import { EditClientPage } from './pages/EditClientPage';
import { EditTaskPage } from './pages/EditTaskPage';
import { DocumentsListPage } from './pages/DocumentsListPage';
import { UploadDocumentPage } from './pages/UploadDocumentPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { UsersListPage } from './pages/UsersListPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { EditUserPage } from './pages/EditUserPage';
import { CalendarPage } from './pages/CalendarPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { DocumentVersionsPage } from './pages/DocumentVersionsPage';
import SettingsPage from './pages/SettingsPage';
import { RoleGuard } from './components/RoleGuard';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import OnboardingWizard from './components/OnboardingWizard';

const queryClient = new QueryClient();

function AppRoutes() {
  const { shortcuts, showHelp, setShowHelp } = useKeyboardShortcuts();

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cases" element={<CasesListPage />} />
          <Route path="cases/new" element={<CreateCasePage />} />
          <Route path="cases/:id" element={<CaseDetailPage />} />
          <Route path="cases/:id/edit" element={<EditCasePage />} />
          <Route path="clients" element={<ClientsListPage />} />
          <Route path="clients/new" element={<CreateClientPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="clients/:id/edit" element={<EditClientPage />} />
          <Route path="tasks" element={<TasksListPage />} />
          <Route path="tasks/new" element={<CreateTaskPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="tasks/:id/edit" element={<EditTaskPage />} />
          <Route path="documents" element={<DocumentsListPage />} />
          <Route path="documents/upload" element={<UploadDocumentPage />} />
          <Route path="documents/:id" element={<DocumentDetailPage />} />
          <Route path="documents/:id/versions" element={<DocumentVersionsPage />} />
          <Route 
            path="users" 
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <UsersListPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="users/new" 
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <CreateUserPage />
              </RoleGuard>
            } 
          />
          <Route 
            path="users/:id/edit" 
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <EditUserPage />
              </RoleGuard>
            } 
          />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route 
            path="audit-logs" 
            element={
              <RoleGuard allowedRoles={['ADMIN', 'NOTAR']}>
                <AuditLogsPage />
              </RoleGuard>
            } 
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        shortcuts={shortcuts}
      />
      
      <OnboardingWizard />
    </>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            <OnboardingProvider>
              <AppContent />
            </OnboardingProvider>
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
