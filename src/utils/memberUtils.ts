export function getMemberTypeLabel(memberType: string | number): string {
  if (typeof memberType === 'number') {
    const labels = {
      0: 'Regular Member',
      1: 'Minor Staff', 
      2: 'Management Staff'
    };
    return labels[memberType as keyof typeof labels] || 'Unknown';
  }
  
  const labels: Record<string, string> = {
    'RegularMember': 'Regular Member',
    'MinorStaff': 'Minor Staff',
    'ManagementStaff': 'Management Staff'
  };
  
  return labels[memberType] || memberType;
}

export function getMemberStatusColor(isActive: boolean): string {
  return isActive 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
}

export function getMemberTypeColor(memberType: string): string {
  switch (memberType.toLowerCase()) {
    case 'regularmember':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'minorstaff':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'managementstaff':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}