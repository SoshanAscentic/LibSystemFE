import React, { useState } from 'react';
import { MembersController } from '../../application/controllers/MemberController';
import { Member } from '../../domain/entities/Member';
import { MemberFilters as MemberFiltersType } from '../../domain/valueObjects/MemberFilters';
import { CreateMemberDto } from '../../domain/dtos/MemberDto';
import { MembersGrid } from '../../components/organisms/MembersGrid';
import { MembersTable } from '../../components/organisms/MembersTable';
import { MemberForm } from '../../components/organisms/MemberForm';
import { MemberDetails } from '../../components/organisms/MemberDetails';
import { SearchBar } from '../../components/molecules/SearchBar';
import { MemberSearchResults } from '../../components/molecules/MemberSearchResults';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Grid, List, Search, X, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMembers } from '../../presentation/hooks/Members/useMembers';
import { useMembersSearch } from '../../presentation/hooks/Members/useMembersSearch';
import { useMemberPermissions } from '../../hooks/useMemberPermissions';
import { memberToCreateMemberDto } from '../../utils/memberUtils';

type ViewMode = 'grid' | 'table';
type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

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
  const [filters, setFilters] = useState<MemberFiltersType>({});
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permissions - Using actual auth context
  const permissions = useMemberPermissions();

  // Data hooks
  const { members, isLoading: membersLoading, refresh: refreshMembers } = useMembers(filters);
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearchQuery,
    clearSearch
  } = useMembersSearch();

  // Event Handlers
  const handleFiltersChange = (newFilters: Partial<MemberFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleSearchToggle = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      clearSearch();
    }
  };

  const handleMemberView = (member: Member) => {
    setModal({ type: 'view', member });
  };

  const handleMemberEdit = (member: Member) => {
    setModal({ type: 'edit', member });
  };

  const handleMemberDelete = (member: Member) => {
    setModal({ type: 'delete', member });
  };

  const handleMemberAdd = () => {
    // Double-check permission before allowing add
    if (!permissions.canAdd) {
      console.warn('User attempted to add member without permission');
      return;
    }
    setModal({ type: 'add' });
  };

  const handleCreateMember = async (data: CreateMemberDto) => {
    setIsSubmitting(true);
    
    const result = await controller.handleCreateMember(data);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setModal({ type: null });
      refreshMembers();
    }
  };

  const handleUpdateMember = async (data: CreateMemberDto) => {
    if (!modal.member) return;
    
    setIsSubmitting(true);
    
    const result = await controller.handleUpdateMember(modal.member.memberId, {
      ...data,
      memberId: modal.member.memberId,
      isActive: modal.member.isActive
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setModal({ type: null });
      refreshMembers();
    }
  };

  const handleConfirmDelete = async () => {
    if (!modal.member) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('🗑️ Deleting member:', modal.member.memberId, modal.member.fullName);
      
      const result = await controller.handleDeleteMember(modal.member);
      
      console.log('🗑️ Delete result:', result);
      
      // Always close modal and refresh
      setModal({ type: null });
      
      console.log('🗑️ Refreshing members list...');
      await refreshMembers();
      console.log('✅ Members refreshed');
      
    } catch (error) {
      console.error('❌ Unexpected error during delete:', error);
      setModal({ type: null });
      await refreshMembers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setModal({ type: null });
    }
  };

  const currentMembers = isSearchMode && hasSearchQuery ? searchResults : members;
  const isLoading = isSearchMode ? isSearching : membersLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
          <p className="text-gray-600 mt-1">
            Manage library members and their information
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Toggle */}
          <Button
            variant={isSearchMode ? 'default' : 'outline'}
            onClick={handleSearchToggle}
          >
            {isSearchMode ? <X className="mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
            {isSearchMode ? 'Exit Search' : 'Search'}
          </Button>

          {/* Conditional Add Member button in header */}
          {permissions.canAdd && (
            <Button onClick={handleMemberAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Member
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

      {/* Search Bar */}
      {isSearchMode && (
        <Card className="p-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search members by name, email, or member type..."
            className="mb-4"
          />
          
          {hasSearchQuery && (
            <MemberSearchResults
              results={searchResults}
              isLoading={isSearching}
              hasSearchQuery={hasSearchQuery}
              searchQuery={searchQuery}
              onMemberView={handleMemberView}
              onMemberEdit={permissions.canEdit ? handleMemberEdit : undefined}
              onMemberDelete={permissions.canDelete ? handleMemberDelete : undefined}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
            />
          )}
        </Card>
      )}

      {/* Main Content */}
      {!isSearchMode && (
        <>
          {viewMode === 'grid' ? (
            <MembersGrid
              members={currentMembers}
              isLoading={isLoading}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              onMemberView={handleMemberView}
              onMemberEdit={permissions.canEdit ? handleMemberEdit : undefined}
              onMemberDelete={permissions.canDelete ? handleMemberDelete : undefined}
              onAddMember={permissions.canAdd ? handleMemberAdd : undefined}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
              canAdd={permissions.canAdd}
            />
          ) : (
            <MembersTable
              members={currentMembers}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onMemberView={handleMemberView}
              onMemberEdit={permissions.canEdit ? handleMemberEdit : undefined}
              onMemberDelete={permissions.canDelete ? handleMemberDelete : undefined}
              onAddMember={permissions.canAdd ? handleMemberAdd : undefined}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
              canAdd={permissions.canAdd}
            />
          )}
        </>
      )}

      {/* Modals */}
      
      {/* Add/Edit Member Modal */}
      <Dialog open={modal.type === 'add' || modal.type === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modal.type === 'add' ? 'Add New Member' : 'Edit Member'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Permission check - Don't render add form if user doesn't have permission */}
          {(modal.type === 'edit' || (modal.type === 'add' && permissions.canAdd)) && (
            <MemberForm
              initialData={modal.member ? memberToCreateMemberDto(modal.member) : undefined}
              onSubmit={modal.type === 'add' ? handleCreateMember : handleUpdateMember}
              onCancel={closeModal}
              isLoading={isSubmitting}
              title={modal.type === 'add' ? 'Add New Member' : 'Edit Member'}
              submitText={modal.type === 'add' ? 'Add Member' : 'Update Member'}
              showPassword={modal.type === 'add'}
            />
          )}
          
          {/* Show error if user somehow gets to add modal without permission */}
          {modal.type === 'add' && !permissions.canAdd && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">You don't have permission to add members.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Member Modal */}
      <Dialog open={modal.type === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {modal.member ? `${modal.member.fullName} - Member Details` : 'Member Details'}
            </DialogTitle>
          </DialogHeader>
          {modal.member && (
            <MemberDetails
              member={modal.member}
              onEdit={permissions.canEdit ? handleMemberEdit : undefined}
              onDelete={permissions.canDelete ? handleMemberDelete : undefined}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={modal.type === 'delete'}
        onOpenChange={(open) => !open && closeModal()}
        onConfirm={handleConfirmDelete}
        title="Delete Member"
        description={
          modal.member
            ? `Are you sure you want to delete "${modal.member.fullName}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Member"
        isLoading={isSubmitting}
        variant="destructive"
      />
    </div>
  );
};