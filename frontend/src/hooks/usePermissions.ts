import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if user has required permission
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (allowedRoles: string[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const canManageUsers = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canSignDocuments = (): boolean => {
    return hasRole(['ADMIN', 'NOTARY']);
  };

  const canManageCases = (): boolean => {
    return hasRole(['ADMIN', 'NOTARY', 'ASSISTANT']);
  };

  const canViewFinancials = (): boolean => {
    return hasRole(['ADMIN', 'NOTARY']);
  };

  const canDeleteEntities = (): boolean => {
    return hasRole(['ADMIN', 'NOTARY']);
  };

  const canEditCase = (caseOwnerId?: number): boolean => {
    if (!user) return false;
    
    // Admin and Notary can edit any case
    if (hasRole(['ADMIN', 'NOTARY'])) return true;
    
    // Assistant can only edit their own cases
    if (user.role === 'ASSISTANT' && caseOwnerId) {
      return user.id === caseOwnerId;
    }
    
    return false;
  };

  const canAssignTasks = (): boolean => {
    return hasRole(['ADMIN', 'NOTARY', 'ASSISTANT']);
  };

  const canAccessAuditLogs = (): boolean => {
    return hasRole(['ADMIN']);
  };

  return {
    user,
    hasRole,
    canManageUsers,
    canSignDocuments,
    canManageCases,
    canViewFinancials,
    canDeleteEntities,
    canEditCase,
    canAssignTasks,
    canAccessAuditLogs,
  };
};
