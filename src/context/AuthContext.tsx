'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, DemoAccountInfo, ROLE_PERMISSIONS } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  demoAccounts: DemoAccountInfo[];
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  canAccessRoute: (pathname: string) => boolean;
  getRoleDetails: (role?: UserRole) => {
    allowedPaths: string[];
    restrictedMessage: string;
    roleBadgeColor: string;
    roleTitle: string;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const TOKEN_STORAGE_KEY = 'ner_auth_token';
const USER_STORAGE_KEY = 'ner_auth_user';

// Fallback client personas if backend server is unreachable
const FALLBACK_DEMO_ACCOUNTS: DemoAccountInfo[] = [
  {
    role: 'ADMIN',
    title: 'EOC Commander / State Administrator',
    username: 'admin',
    full_name: 'Brig. Sanjeev Sharma',
    department: 'National Disaster Management Authority (NDMA / NEC)',
    jurisdiction: 'All 8 Northeast States',
    badge_number: 'EOC-CMD-001',
    description: 'Full executive command authority over early warning broadcasts, ML telemetry, user access, and mountain battalion mobilization.',
    permissions_summary: ['Full System Access', 'Issue CAP Broadcast Bulletins', 'Authorize Tactical Dispatches', 'System Administration']
  },
  {
    role: 'DISTRICT_OFFICER',
    title: 'District Disaster Management Officer (DDMO)',
    username: 'district_officer',
    full_name: 'Dr. Tenzing Norbu Lepcha',
    department: 'District Disaster Management Authority (DDMA)',
    jurisdiction: 'Pakyong & East Sikkim Districts',
    badge_number: 'DDMA-SK-042',
    description: 'Monitors district hazard zones, evaluates alert thresholds, reviews verified incidents, and coordinates local emergency response.',
    permissions_summary: ['GIS Risk Maps', 'Early Warning Alerts', 'Incident Review', 'Emergency Response Prioritization', 'Weather & Analytics']
  },
  {
    role: 'FIELD_OFFICER',
    title: 'First Responder / SDRF Field Officer',
    username: 'field_officer',
    full_name: 'Sub-Inspector Bhaskar Kalita',
    department: 'State Disaster Response Force (SDRF / BRO)',
    jurisdiction: 'Dima Hasao & Cachar Corridors',
    badge_number: 'SDRF-AS-118',
    description: 'Performs ground reconnaissance, captures tension cracks with AI computer vision, logs offline reports, and verifies landslide breaches.',
    permissions_summary: ['Field Hazard Reporting', 'Offline PWA Queue', 'Ground Incident Verification', 'Live GPS Mapping']
  },
  {
    role: 'CITIZEN',
    title: 'Citizen / Community Volunteer',
    username: 'citizen',
    full_name: 'Ibakordor Khongwir',
    department: 'Aapda Mitra Volunteer',
    jurisdiction: 'East Khasi Hills (Mawkdok)',
    badge_number: 'AM-ML-884',
    description: 'Public safety access to view regional risk advisories, weather telemetry, active warnings, and submit citizen hazard reports.',
    permissions_summary: ['View Public Risk Maps', 'View Weather Advisories', 'Submit Citizen Reports', 'Receive Live Bulletins']
  },
];

const DEFAULT_ADMIN_USER: User = {
  id: 'USR-ADM-001',
  username: 'admin',
  email: 'commander.eoc@ner.gov.in',
  full_name: 'Brig. Sanjeev Sharma',
  role: 'ADMIN',
  jurisdiction: '8 Northeast States (NEC Command)',
  department: 'National Disaster Management Authority (NDMA / NEC)',
  badge_number: 'EOC-CMD-001',
  is_active: true,
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_ADMIN_USER);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccountInfo[]>(FALLBACK_DEMO_ACCOUNTS);

  // Initialize and restore saved session
  useEffect(() => {
    async function initAuth() {
      try {
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);

        if (savedToken && savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
          setToken(savedToken);

          // Verify with backend if online
          try {
            const res = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${savedToken}` },
              signal: AbortSignal.timeout(3000),
            });
            if (res.ok) {
              const liveUser = await res.json();
              setUser(liveUser);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(liveUser));
            }
          } catch {
            // Keep saved local user if backend is offline
          }
        } else {
          // Default to Admin session in development/demo mode
          setUser(DEFAULT_ADMIN_USER);
        }

        // Fetch latest demo accounts list from backend
        try {
          const accRes = await fetch(`${API_BASE}/auth/demo-accounts`, {
            signal: AbortSignal.timeout(3000),
          });
          if (accRes.ok) {
            const accounts = await accRes.json();
            setDemoAccounts(accounts);
          }
        } catch {
          setDemoAccounts(FALLBACK_DEMO_ACCOUNTS);
        }
      } catch (err) {
        console.warn('[AuthContext] Session init error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_or_email: usernameOrEmail,
          password: password,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setIsLoading(false);
        return {
          success: false,
          error: errData.detail || 'Invalid username or password.',
        };
      }

      const data = await res.json();
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.warn('[AuthContext] Backend login unreachable, checking local demo persona:', err);
      // Fallback local match for offline mode
      const match = FALLBACK_DEMO_ACCOUNTS.find(
        (a) => a.username.toLowerCase() === usernameOrEmail.toLowerCase()
      );
      if (match) {
        const fallbackUser: User = {
          id: `USR-${match.role.slice(0, 3)}-OFFLINE`,
          username: match.username,
          email: `${match.username}@ner.gov.in`,
          full_name: match.full_name,
          role: match.role,
          jurisdiction: match.jurisdiction,
          department: match.department,
          badge_number: match.badge_number,
          is_active: true,
        };
        setUser(fallbackUser);
        setToken('offline-demo-token');
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: 'Connection failed. Please check backend server.' };
    }
  };

  const demoLogin = async (targetRole: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        setIsLoading(false);
        return true;
      }
    } catch {
      // Fallback offline demo login
    }

    const match = FALLBACK_DEMO_ACCOUNTS.find((a) => a.role === targetRole) || FALLBACK_DEMO_ACCOUNTS[0];
    const fallbackUser: User = {
      id: `USR-${match.role.slice(0, 3)}-DEMO`,
      username: match.username,
      email: `${match.username}@ner.gov.in`,
      full_name: match.full_name,
      role: match.role,
      jurisdiction: match.jurisdiction,
      department: match.department,
      badge_number: match.badge_number,
      is_active: true,
    };
    setUser(fallbackUser);
    setToken('offline-demo-token');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    // Revert to Citizen guest persona or clear
    const citizenUser: User = {
      id: 'USR-CTZ-004',
      username: 'citizen',
      email: 'volunteer.shillong@gmail.com',
      full_name: 'Ibakordor Khongwir',
      role: 'CITIZEN',
      jurisdiction: 'East Khasi Hills (Mawkdok)',
      department: 'Aapda Mitra Community Volunteer',
      badge_number: 'AM-ML-884',
      is_active: true,
    };
    setUser(citizenUser);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(citizenUser));
  };

  const canAccessRoute = (pathname: string): boolean => {
    if (!user) return pathname === '/' || pathname === '/login';
    const roleConfig = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.CITIZEN;
    
    // Normalize path
    const normalized = pathname.split('?')[0].replace(/\/$/, '') || '/';
    return roleConfig.allowedPaths.includes(normalized) || user.role === 'ADMIN';
  };

  const getRoleDetails = (targetRole?: UserRole) => {
    const r = targetRole || user?.role || 'CITIZEN';
    return ROLE_PERMISSIONS[r] || ROLE_PERMISSIONS.CITIZEN;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role || 'CITIZEN',
        demoAccounts,
        login,
        demoLogin,
        logout,
        canAccessRoute,
        getRoleDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
