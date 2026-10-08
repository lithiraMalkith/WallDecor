"use client";

// ============================================================================
// Ceylon Wall Decor — Auth Context & Firebase RBAC Provider
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { getStaffFromFirestore, saveStaffToFirestore } from "@/lib/firestore-service";
import type { BuiltInRole, UserProfile } from "@/types";
import {
  BUILT_IN_ROLE_PERMISSIONS,
  hasRolePermission,
  type Permission,
} from "@/lib/permissions";
import { formatAuthError } from "@/lib/auth-errors";

interface AuthContextType {
  user: UserProfile | null;
  role: BuiltInRole | string;
  permissions: Permission[] | string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasPermission: (permission: Permission | string) => boolean;
  login: (
    email: string,
    password?: string,
    preferredRole?: BuiltInRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: BuiltInRole) => void;
}

export const DEFAULT_DEMO_USERS: Record<BuiltInRole, UserProfile> = {
  superadmin: {
    uid: "usr_owner_001",
    email: "owner@ceylonwalldecor.lk",
    displayName: "Lithira Gunasekara (Owner)",
    role: "superadmin",
    phone: "0782518184",
    createdAt: "2026-01-15T08:00:00Z",
    lastLoginAt: new Date().toISOString(),
    isActive: true,
  },
  manager: {
    uid: "usr_mgr_002",
    email: "manager@ceylonwalldecor.lk",
    displayName: "Anura Perera (Store Manager)",
    role: "manager",
    phone: "0771234567",
    createdAt: "2026-02-01T09:30:00Z",
    lastLoginAt: new Date().toISOString(),
    isActive: true,
  },
  order_staff: {
    uid: "usr_stf_003",
    email: "fulfillment@ceylonwalldecor.lk",
    displayName: "Kavindi Silva (Order Fulfillment)",
    role: "order_staff",
    phone: "0719876543",
    createdAt: "2026-02-15T11:00:00Z",
    lastLoginAt: new Date().toISOString(),
    isActive: true,
  },
  content_editor: {
    uid: "usr_edt_004",
    email: "editor@ceylonwalldecor.lk",
    displayName: "Dinuka Fernando (Catalog Editor)",
    role: "content_editor",
    phone: "0765554321",
    createdAt: "2026-03-01T14:15:00Z",
    lastLoginAt: new Date().toISOString(),
    isActive: true,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "cwd_admin_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session from localStorage & Firebase on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        setUser(parsed);
      } else {
        // Default to superadmin demo for preview
        setUser(DEFAULT_DEMO_USERS.superadmin);
      }
    } catch {
      setUser(DEFAULT_DEMO_USERS.superadmin);
    } finally {
      setIsLoading(false);
    }

    // Subscribe to real Firebase Auth state changes
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          try {
            // Check Firestore staff collection
            let staff = await getStaffFromFirestore(fbUser.uid);
            if (!staff && fbUser.email) {
              staff = await getStaffFromFirestore(fbUser.email);
            }

            if (staff) {
              setUser(staff);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(staff));
            } else {
              // Auto-seed owner profile if owner email matches
              const isOwnerEmail =
                fbUser.email?.toLowerCase() === "owner@ceylonwalldecor.lk" ||
                fbUser.email?.toLowerCase().startsWith("admin@");

              const newStaffProfile: UserProfile = {
                uid: fbUser.uid,
                email: fbUser.email || "staff@ceylonwalldecor.lk",
                displayName: fbUser.displayName || (fbUser.email?.split("@")[0] ?? "Staff Member"),
                role: isOwnerEmail ? "superadmin" : "manager",
                photoURL: fbUser.photoURL || undefined,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                isActive: true,
              };

              await saveStaffToFirestore(newStaffProfile);
              setUser(newStaffProfile);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newStaffProfile));
            }
          } catch (err) {
            console.warn("Error synchronizing staff profile with Firestore:", err);
          }
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const login = async (
    email: string,
    password?: string,
    preferredRole: BuiltInRole = "superadmin",
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim();

      // Case 1: Firebase Auth with real password provided
      if (isFirebaseConfigured && auth && cleanEmail && password) {
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          const fbUser = cred.user;

          // Fetch or initialize staff profile from Firestore
          let staff = await getStaffFromFirestore(fbUser.uid);
          if (!staff && fbUser.email) {
            staff = await getStaffFromFirestore(fbUser.email);
          }

          if (!staff) {
            let assignedRole: BuiltInRole = preferredRole || "manager";
            const lowerEmail = cleanEmail.toLowerCase();
            if (lowerEmail.includes("owner") || lowerEmail.includes("admin")) {
              assignedRole = "superadmin";
            } else if (lowerEmail.includes("manager")) {
              assignedRole = "manager";
            } else if (lowerEmail.includes("fulfill") || lowerEmail.includes("order")) {
              assignedRole = "order_staff";
            } else if (lowerEmail.includes("editor") || lowerEmail.includes("content")) {
              assignedRole = "content_editor";
            }

            staff = {
              uid: fbUser.uid,
              email: fbUser.email || cleanEmail,
              displayName: fbUser.displayName || cleanEmail.split("@")[0],
              role: assignedRole,
              photoURL: fbUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              isActive: true,
            };
            await saveStaffToFirestore(staff);
          } else {
            staff.lastLoginAt = new Date().toISOString();
            await saveStaffToFirestore(staff);
          }

          setUser(staff);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(staff));
          return { success: true };
        } catch (firebaseErr: any) {
          console.warn("[Staff Sign-in Notice]", firebaseErr?.code || firebaseErr?.message);
          return {
            success: false,
            error: formatAuthError(firebaseErr),
          };
        }
      }

      // Case 2: Offline / Local Developer Session
      let fallbackRole: BuiltInRole = preferredRole || "superadmin";
      const lower = cleanEmail.toLowerCase();
      if (lower.includes("owner") || lower.includes("admin")) {
        fallbackRole = "superadmin";
      } else if (lower.includes("manager")) {
        fallbackRole = "manager";
      } else if (lower.includes("fulfill") || lower.includes("order")) {
        fallbackRole = "order_staff";
      } else if (lower.includes("editor") || lower.includes("content")) {
        fallbackRole = "content_editor";
      }

      const profile: UserProfile = {
        ...DEFAULT_DEMO_USERS[fallbackRole],
        email: cleanEmail || DEFAULT_DEMO_USERS[fallbackRole].email,
        role: fallbackRole,
        lastLoginAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (auth && isFirebaseConfigured) {
      firebaseSignOut(auth).catch((err) => {
        console.warn("Firebase signout notice:", err);
      });
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push("/adminlogin");
  };

  const switchRole = (newRole: BuiltInRole) => {
    if (!DEFAULT_DEMO_USERS[newRole]) return;
    const updated = {
      ...DEFAULT_DEMO_USERS[newRole],
      lastLoginAt: new Date().toISOString(),
    };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  const currentRole = (user?.role as BuiltInRole) || "superadmin";
  const permissions = BUILT_IN_ROLE_PERMISSIONS[currentRole] || [];

  const hasPermission = (permission: Permission | string): boolean => {
    if (!user) return false;
    return hasRolePermission(user.role, permission);
  };

  const value: AuthContextType = {
    user,
    role: currentRole,
    permissions,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: currentRole === "superadmin" || currentRole === "manager",
    hasPermission,
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
