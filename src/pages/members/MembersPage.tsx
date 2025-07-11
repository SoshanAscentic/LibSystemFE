import React, { useState } from 'react';
import { MembersController } from '../../application/controllers/MemberController';
import { Member } from '../../domain/entities/Member';
import { RegisterMemberDto } from '../../domain/dtos/MemberDto';
import { MembersGrid } from '../../components/organisms/MembersGrid';
import { MembersTable } from '../../components/organisms/MembersTable';
import { MemberForm } from '../../components/organisms/MemberForm';
import { MemberDetails } from '../../components/organisms/MemberDetails';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Grid, List, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMembers } from '../../presentation/hooks/Members/useMembers';
import { useSecurePermissions, PermissionGate } from '../../hooks/useSecurePermissions'; // CHANGED

type ViewMode = 'grid' | 'table';
type ModalType = 'add' | 'view' | null;

interface ModalState {
  type: ModalType;
  member?: Member;
}

interface MembersPageProps {
  controller: MembersController;
}

export const MembersPage: React.FC<MembersPageProps> = ({ controller }) => {
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SECURE Permissions - Server-verified (only administrators can manage members)
  const permissions = useSecurePermissions(); // CHANGED

  // Data hooks
  const { members, isLoading: membersLoading, refresh: refreshMembers } = useMembers();

  // Event Handlers
  const handleMemberView = (member: Member) => {
    setModal({ type: 'view', member });
  };

  const handleMemberAdd = () => {
    // SECURITY: Double-check permission before allowing add
    if (!permissions.canManageUsers) {
      console.warn('User attempted to add member without permission');
      return;
    }
    setModal({ type: 'add' });
  };

  const handleRegisterMember = async (data: RegisterMemberDto) => {
    setIsSubmitting(true);
    
    const result = await controller.handleRegisterMember(data);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setModal({ type: null });
      refreshMembers();
    }
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setModal({ type: null });
    }
  };

  // Show loading state if permissions are still being verified
  if (permissions.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Permissions</h2>
          <p className="text-gray-600">Checking your access rights to member management...</p>
        </div>
      </div>
    );
  }

  // Show error if permission verification failed
  if (permissions.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Permission Error</h2>
            <p className="text-sm">{permissions.error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // SECURITY: Check if user can view members at all
  if (!permissions.canViewBorrowing) { // Members viewing requires at least staff level
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
            <p className="text-sm">You don't have permission to view member information.</p>
            <p className="text-xs mt-2">Contact an administrator if you need access.</p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Members Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage library members
          </p>
          {/* SECURITY: Show user's permission level */}
          <div className="text-xs text-gray-500 mt-1">
            Access Level: {permissions.canManageUsers ? '🔑 Administrator' : '👁️ View Only'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* SECURE: Add Member button - Only for administrators */}
          <PermissionGate 
            requiredPermissions={['canManageUsers']}
            fallback={
              <div className="text-sm text-gray-500 italic">
                👤 Only administrators can register new members
              </div>
            }
          >
            <Button onClick={handleMemberAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Register New Member
            </Button>
          </PermissionGate>

          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'grid' ? (
        <MembersGrid
          members={members}
          isLoading={membersLoading}
          onMemberView={handleMemberView}
          onAddMember={permissions.canManageUsers ? handleMemberAdd : undefined}
          canAdd={permissions.canManageUsers}
        />
      ) : (
        <MembersTable
          members={members}
          isLoading={membersLoading}
          onMemberView={handleMemberView}
          onAddMember={permissions.canManageUsers ? handleMemberAdd : undefined}
          canAdd={permissions.canManageUsers}
        />
      )}

      {/* SECURE Modals with Permission Gates */}
      
      {/* Register Member Modal - Only for administrators */}
      <Dialog open={modal.type === 'add'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Register New Member
            </DialogTitle>
          </DialogHeader>
          
          {/* SECURE: Triple-check permissions in modal */}
          <PermissionGate 
            requiredPermissions={['canManageUsers']}
            fallback={
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🔐</span>
                  <div>
                    <p className="text-red-600 font-medium">Access Denied</p>
                    <p className="text-red-500 text-sm">Only administrators can register new members.</p>
                  </div>
                </div>
              </div>
            }
          >
            <MemberForm
              onSubmit={handleRegisterMember}
              onCancel={closeModal}
              isLoading={isSubmitting}
              title="Register New Member"
              submitText="Register Member"
            />
          </PermissionGate>
        </DialogContent>
      </Dialog>

      {/* View Member Modal */}
      <Dialog open={modal.type === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-[95vw] xl:max-w-[85vw] 2xl:max-w-[80vw] w-full max-h-[95vh] h-[95vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {modal.member ? `${modal.member.fullName || `${modal.member.firstName || ''} ${modal.member.lastName || ''}`.trim() || 'Unknown Member'} - Member Details` : 'Member Details'}
            </DialogTitle>
            {/* SECURITY: Show viewing permission context */}
            <div className="text-sm text-gray-500">
              Access: {permissions.canManageUsers ? 'Administrator View' : 'Staff View'}
            </div>
          </DialogHeader>
          <div 
            className="flex-1 overflow-y-auto p-6" 
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc'
            }}
          >
            {modal.member && (
              <div className="max-w-7xl mx-auto">
                <MemberDetails
                  member={modal.member}
                  canEdit={false} // Editing not implemented yet
                  canDelete={false} // Deleting not implemented yet
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};