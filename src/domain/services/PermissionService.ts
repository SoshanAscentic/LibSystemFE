import { Permission, UserRole } from '../entities/User';

export class PermissionService {
  getPermissionsForRole(role: UserRole): Permission[] {
    switch (role) {
      case UserRole.MEMBER:
        return [
          { resource: 'books', actions: ['read'] },
          { resource: 'members', actions: ['read'] },
          { resource: 'borrowing', actions: ['borrow', 'read'] }
        ];

      case UserRole.MINOR_STAFF:
        return [
          { resource: 'books', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'members', actions: ['read'] },
          { resource: 'borrowing', actions: ['read'] }
        ];

      case UserRole.MANAGEMENT_STAFF:
        return [
          { resource: 'books', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'members', actions: ['read'] },
          { resource: 'borrowing', actions: ['create', 'read', 'update', 'delete'] }
        ];

      case UserRole.ADMINISTRATOR:
        return [
          { resource: 'books', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'members', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'borrowing', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'users', actions: ['create', 'read', 'update', 'delete'] }
        ];

      default:
        return [];
    }
  }

  hasPermission(userPermissions: Permission[], resource: string, action: string): boolean {
    return userPermissions.some(permission => 
      permission.resource === resource && permission.actions.includes(action as any)
    );
  }

  canBorrow(userPermissions: Permission[]): boolean {
    return this.hasPermission(userPermissions, 'borrowing', 'borrow');
  }

  canManageBooks(userPermissions: Permission[]): boolean {
    return this.hasPermission(userPermissions, 'books', 'create');
  }

  canManageMembers(userPermissions: Permission[]): boolean {
    return this.hasPermission(userPermissions, 'members', 'create');
  }

  canManageUsers(userPermissions: Permission[]): boolean {
    return this.hasPermission(userPermissions, 'users', 'read');
  }
}

