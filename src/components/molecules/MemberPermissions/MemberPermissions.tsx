import React from 'react';
import { Member, UserRole } from '../../../domain/entities/Member';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import { Badge } from '../../ui/badge';
import { Check, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MemberPermissionsProps {
  member: Member;
  className?: string;
}

interface Permission {
  label: string;
  description: string;
  hasPermission: boolean;
}

export const MemberPermissions: React.FC<MemberPermissionsProps> = ({
  member,
  className
}) => {
  const getPermissions = (member: Member): Permission[] => {
    return [
      {
        label: 'View Books',
        description: 'Can browse and search the book catalog',
        hasPermission: member.canViewBooks
      },
      {
        label: 'Borrow Books',
        description: 'Can check out books from the library',
        hasPermission: member.canBorrowBooks
      },
      {
        label: 'View Members',
        description: 'Can view other library members',
        hasPermission: member.canViewMembers
      },
      {
        label: 'Manage Books',
        description: 'Can add, edit, and delete books',
        hasPermission: member.canManageBooks
      }
    ];
  };

  const permissions = getPermissions(member);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Permissions</span>
          <Badge variant="outline" className="text-xs">
            {member.role}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {permissions.map((permission, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                permission.hasPermission 
                  ? "bg-green-100 text-green-600" 
                  : "bg-gray-100 text-gray-400"
              )}>
                {permission.hasPermission ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  permission.hasPermission ? "text-gray-900" : "text-gray-500"
                )}>
                  {permission.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {permission.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
