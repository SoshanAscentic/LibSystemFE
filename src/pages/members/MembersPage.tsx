//src/pages/members/MembersPage.tsx
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
import { useMemberPermissions } from '../../hooks/useMemberPermissions';

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

  // Permissions - Only administrators can add members
  const permissions = useMemberPermissions();

  // Data hooks
  const { members, isLoading: membersLoading, refresh: refreshMembers } = useMembers();

  // Event Handlers
  const handleMemberView = (member: Member) => {
    setModal({ type: 'view', member });
  };

  const handleMemberAdd = () => {
    // Double-check permission before allowing add
    if (!permissions.canAdd) {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage library members
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Member button - Only for administrators */}
          {permissions.canAdd && (
            <Button onClick={handleMemberAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Register New Member
            </Button>
          )}

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
          onAddMember={permissions.canAdd ? handleMemberAdd : undefined}
          canAdd={permissions.canAdd}
        />
      ) : (
        <MembersTable
          members={members}
          isLoading={membersLoading}
          onMemberView={handleMemberView}
          onAddMember={permissions.canAdd ? handleMemberAdd : undefined}
          canAdd={permissions.canAdd}
        />
      )}

      {/* Modals */}
      
      {/* Register Member Modal */}
      <Dialog open={modal.type === 'add'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Register New Member
            </DialogTitle>
          </DialogHeader>
          
          {/* Permission check */}
          {permissions.canAdd ? (
            <MemberForm
              onSubmit={handleRegisterMember}
              onCancel={closeModal}
              isLoading={isSubmitting}
              title="Register New Member"
              submitText="Register Member"
            />
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">You don't have permission to register members.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Member Modal */}
      <Dialog open={modal.type === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-[95vw] xl:max-w-[85vw] 2xl:max-w-[80vw] w-full max-h-[95vh] h-[95vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {modal.member ? `${modal.member.fullName || `${modal.member.firstName || ''} ${modal.member.lastName || ''}`.trim() || 'Unknown Member'} - Member Details` : 'Member Details'}
            </DialogTitle>
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
                  canEdit={false}
                  canDelete={false}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};