import { AbilityBuilder, Ability, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'export' | 'import';

type Subjects = InferSubjects<
  | 'Shipment'
  | 'Inventory'
  | 'Report'
  | 'User'
  | 'all'
>;

export type AppAbility = Ability<[Actions, Subjects]>;

const AppAbility = Ability as AbilityClass<AppAbility>;

export function defineAbilityFor(user: { role: string; id: string }) {
  const { can, cannot, build } = new AbilityBuilder(AppAbility);

  if (user.role === 'admin') {
    can('manage', 'all');
  } else if (user.role === 'manager') {
    can('read', 'all');
    can('create', 'Shipment');
    can('update', 'Shipment');
    can('export', 'Report');
    can('import', 'Shipment');
  } else if (user.role === 'operator') {
    can('read', 'Shipment');
    can('update', 'Shipment');
    can('create', 'Shipment');
  } else {
    // Viewer role
    can('read', 'Shipment');
    can('read', 'Report');
  }

  return build({
    detectSubjectType: (item: Record<string, unknown>) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
}

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
