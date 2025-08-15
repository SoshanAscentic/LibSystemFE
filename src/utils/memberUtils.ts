import { Member } from '../domain/entities/Member';

/**
 * Get member type display label with proper Administrator handling
 */
export function getMemberTypeLabel(memberType: string | number): string {
  if (typeof memberType === 'number') {
    const labels = {
      0: 'Regular Member',
      1: 'Minor Staff', 
      2: 'Management Staff',
      3: 'Administrator'  // Added Administrator
    };
    return labels[memberType as keyof typeof labels] || 'Unknown';
  }
  
  const labels: Record<string, string> = {
    'RegularMember': 'Regular Member',
    'MinorStaff': 'Minor Staff',
    'ManagementStaff': 'Management Staff',
    'Administrator': 'Administrator',
    'Member': 'Regular Member', 
  };
  
  return labels[memberType] || memberType;
}

/**
 * Get role display label
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    'Member': 'Regular Member',
    'MinorStaff': 'Minor Staff',
    'ManagementStaff': 'Management Staff',
    'Administrator': 'Administrator'
  };
  
  return labels[role] || role;
}

/**
 * Get member status color classes
 */
export function getMemberStatusColor(isActive: boolean): string {
  return isActive 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
}

/**
 * Get member type color classes with Administrator support
 */
export function getMemberTypeColor(memberType: string, role?: string): string {
  // Check role first, then memberType
  const typeToCheck = role || memberType;
  
  switch (typeToCheck.toLowerCase()) {
    case 'regularmember':
    case 'member':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'minorstaff':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'managementstaff':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'administrator':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get role color classes
 */
export function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case 'member':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'minorstaff':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'managementstaff':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'administrator':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Calculate membership days with proper date validation
 */
export function calculateMembershipDays(registrationDate: Date | string): number {
  try {
    const regDate = typeof registrationDate === 'string' ? new Date(registrationDate) : registrationDate;
    const now = new Date();
    
    // Validate the date
    if (isNaN(regDate.getTime())) {
      console.warn('Invalid registration date:', registrationDate);
      return 0;
    }
    
    const diffTime = now.getTime() - regDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error calculating membership days:', error);
    return 0;
  }
}

/**
 * Format membership duration in human-readable format
 */
export function formatMembershipDuration(days: number): string {
  if (days === 0) return 'Joined today';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  if (remainingDays < 30) {
    return years === 1 ? '1 year' : `${years} years`;
  } else {
    const months = Math.floor(remainingDays / 30);
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  }
}

/**
 * Get member type from number
 */
export function getMemberTypeFromNumber(memberType: number): string {
  const types = {
    0: 'RegularMember',
    1: 'MinorStaff',
    2: 'ManagementStaff',
    3: 'Administrator'
  };
  return types[memberType as keyof typeof types] || 'RegularMember';
}

/**
 * Get member type number from string
 */
export function getMemberTypeNumber(memberType: string): number {
  const typeMap = {
    'RegularMember': 0,
    'MinorStaff': 1,
    'ManagementStaff': 2,
    'Administrator': 3,
    'Member': 0  // Map role names to numbers too
  };
  return typeMap[memberType as keyof typeof typeMap] ?? 0;
}

/**
 * Check if member can perform an action based on their role
 */
export function canMemberPerformAction(memberRole: string, action: 'view' | 'edit' | 'delete' | 'create'): boolean {
  const permissions = {
    'Member': ['view'],
    'MinorStaff': ['view', 'edit'],
    'ManagementStaff': ['view', 'edit', 'create', 'delete'],
    'Administrator': ['view', 'edit', 'create', 'delete']
  };
  
  return permissions[memberRole as keyof typeof permissions]?.includes(action) || false;
}

/**
 * Get member display name safely
 */
export function getMemberDisplayName(member: Member): string {
  return member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member';
}

/**
 * Get member type display with role priority
 */
export function getMemberTypeDisplay(member: Member): string {
  // Prioritize role over memberType for display
  switch (member.role) {
    case 'Member':
      return 'Regular Member';
    case 'MinorStaff':
      return 'Minor Staff';
    case 'ManagementStaff':
      return 'Management Staff';
    case 'Administrator':
      return 'Administrator';
    default:
      // Fallback to memberType if role is not recognized
      switch (member.memberType) {
        case 'RegularMember':
          return 'Regular Member';
        case 'MinorStaff':
          return 'Minor Staff';
        case 'ManagementStaff':
          return 'Management Staff';
        case 'Administrator':
          return 'Administrator';
        default:
          return 'Regular Member';
      }
  }
}

/**
 * Validate member data
 */
export function validateMemberData(member: Partial<Member>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!member.firstName?.trim()) {
    errors.push('First name is required');
  }
  
  if (!member.lastName?.trim()) {
    errors.push('Last name is required');
  }
  
  if (!member.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!member.memberType) {
    errors.push('Member type is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sort members by various criteria
 */
export function sortMembers(members: Member[], sortBy: 'name' | 'email' | 'type' | 'date' | 'status' = 'name', direction: 'asc' | 'desc' = 'asc'): Member[] {
  return [...members].sort((a, b) => {
    let valueA: any;
    let valueB: any;
    
    switch (sortBy) {
      case 'name':
        valueA = getMemberDisplayName(a).toLowerCase();
        valueB = getMemberDisplayName(b).toLowerCase();
        break;
      case 'email':
        valueA = a.email.toLowerCase();
        valueB = b.email.toLowerCase();
        break;
      case 'type':
        valueA = getMemberTypeDisplay(a);
        valueB = getMemberTypeDisplay(b);
        break;
      case 'date':
        valueA = a.registrationDate.getTime();
        valueB = b.registrationDate.getTime();
        break;
      case 'status':
        valueA = a.isActive ? 1 : 0;
        valueB = b.isActive ? 1 : 0;
        break;
      default:
        valueA = getMemberDisplayName(a).toLowerCase();
        valueB = getMemberDisplayName(b).toLowerCase();
    }
    
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filter members by search query
 */
export function filterMembers(members: Member[], searchQuery: string): Member[] {
  if (!searchQuery.trim()) return members;
  
  const query = searchQuery.toLowerCase();
  return members.filter(member => 
    getMemberDisplayName(member).toLowerCase().includes(query) ||
    member.email.toLowerCase().includes(query) ||
    getMemberTypeDisplay(member).toLowerCase().includes(query) ||
    member.memberId.toString().includes(query)
  );
}