/**
 * Authentication and Role-Based Access Control (RBAC) Type Definitions.
 */

export type UserRole = 'ADMIN' | 'DISTRICT_OFFICER' | 'FIELD_OFFICER' | 'CITIZEN';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  jurisdiction: string;
  department: string;
  badge_number?: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface DemoAccountInfo {
  role: UserRole;
  title: string;
  username: string;
  full_name: string;
  department: string;
  jurisdiction: string;
  badge_number?: string;
  description: string;
  permissions_summary: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
}

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  ADMIN: '/dashboard',
  DISTRICT_OFFICER: '/district',
  FIELD_OFFICER: '/field',
  CITIZEN: '/citizen',
};

/**
 * Route Permission Access Matrix according to specifications:
 *
 * ADMIN: Full platform access
 * DISTRICT_OFFICER: Risk map, alerts, incidents, emergency response, analytics, weather, predictions
 * FIELD_OFFICER: Map, field reports, incident verification, offline queue
 * CITIZEN: View public risk information, submit reports, view alerts, weather
 */
export const ROLE_PERMISSIONS: Record<UserRole, {
  allowedPaths: string[];
  restrictedMessage: string;
  roleBadgeColor: string;
  roleTitle: string;
}> = {
  ADMIN: {
    allowedPaths: [
      '/',
      '/dashboard',
      '/district',
      '/field',
      '/citizen',
      '/map',
      '/predictions',
      '/weather',
      '/sensors',
      '/reports',
      '/field-report',
      '/offline-queue',
      '/roads',
      '/alerts',
      '/emergency',
      '/analytics',
      '/admin',
      '/settings'
    ],
    restrictedMessage: 'Full executive command privileges granted.',
    roleBadgeColor: 'bg-purple-950 text-purple-300 border-purple-700',
    roleTitle: 'EOC Commander / Administrator',
  },
  DISTRICT_OFFICER: {
    allowedPaths: [
      '/',
      '/district',
      '/citizen',
      '/map',
      '/predictions',
      '/weather',
      '/sensors',
      '/reports',
      '/field-report',
      '/offline-queue',
      '/roads',
      '/alerts',
      '/emergency',
      '/analytics',
      '/settings'
    ],
    restrictedMessage: 'District Disaster Management Authority (DDMA) Access Level.',
    roleBadgeColor: 'bg-sky-950 text-sky-300 border-sky-700',
    roleTitle: 'District Disaster Management Officer (DDMO)',
  },
  FIELD_OFFICER: {
    allowedPaths: [
      '/',
      '/field',
      '/citizen',
      '/map',
      '/field-report',
      '/offline-queue',
      '/reports',
      '/weather',
      '/roads',
      '/settings'
    ],
    restrictedMessage: 'First Responder / Field Reconnaissance Access Level.',
    roleBadgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
    roleTitle: 'SDRF / BRO First Responder',
  },
  CITIZEN: {
    allowedPaths: [
      '/',
      '/citizen',
      '/map',
      '/weather',
      '/alerts',
      '/field-report',
      '/offline-queue',
      '/settings'
    ],
    restrictedMessage: 'Citizen & Community Safety Portal Access.',
    roleBadgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    roleTitle: 'Citizen / Community Volunteer',
  },
};

