"use client";

// ============================================================================
// Ceylon Wall Decor — Customer Authentication & Account Context (Firebase Secure)
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CustomerUser } from "@/types";
import type { User as FirebaseUser } from 'firebase/auth';
import { usePathname } from 'next/navigation';

function createCustomerServices() {
  return Promise.all([import('@/lib/firebase'), import('firebase/auth'), import('@/lib/firestore-service')]).then(([firebase, sdk, store]) => ({ ...firebase, ...sdk, ...store, firebaseSignOut: sdk.signOut, updateFirebaseProfile: sdk.updateProfile }));
}
let services: ReturnType<typeof createCustomerServices> | undefined;
function loadCustomerServices() {
  services ??= createCustomerServices().catch(error => { services = undefined; throw error; });
  return services;
}
import { formatAuthError } from "@/lib/auth-errors";

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    phoneOrEmail: string,
    passwordOrOtp?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    address?: string;
    city?: string;
    district?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    data: Partial<CustomerUser>
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickDemoLogin: (presetIndex?: number) => void;
}

const STORAGE_KEY = "cwd_customer_session";

// Demo customers matching seed orders for effortless preview
export const DEMO_CUSTOMERS: CustomerUser[] = [
  {
    id: "cust_demo_01",
    name: "Sachithra Weerasinghe",
    phone: "0771234567",
    email: "sachithra.w@gmail.com",
    address: "42/3 Horton Place",
    city: "Colombo 07",
    district: "Colombo",
    postalCode: "00700",
    createdAt: "2026-02-12T10:00:00Z",
  },
  {
    id: "cust_demo_02",
    name: "Malik De Silva",
    phone: "0777123456",
    email: "malik.desilva@yahoo.com",
    address: "15/A Richmond Hill Road",
    city: "Kandy",
    district: "Kandy",
    postalCode: "20000",
    createdAt: "2026-02-20T14:30:00Z",
  },
  {
    id: "cust_demo_03",
    name: "Nadeeka Perera",
    phone: "0712345678",
    email: "nadeeka.p@outlook.com",
    address: "88 Lighthouse Street, Fort",
    city: "Galle",
    district: "Galle",
    postalCode: "80000",
    createdAt: "2026-03-01T09:15:00Z",
  },
];

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const saveCustomer = (user: CustomerUser | null) => {
    setCustomer(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Hydrate from localStorage on client mount, listen to Firebase Auth & check redirect result
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomer(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoading(false);
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    const connect = async () => {
      try {
        const { isFirebaseConfigured, auth, getRedirectResult, getCustomerFromFirestore, saveCustomerToFirestore, onAuthStateChanged } = await loadCustomerServices();
        if (cancelled) return;
        if (isFirebaseConfigured && auth) {
          // Check Google OAuth redirect result if returning from redirect
          getRedirectResult(auth)
            .then(async (result) => {
              if (result?.user) {
                const fbUser = result.user;
                const email = (fbUser.email || "").trim().toLowerCase();
                const name = fbUser.displayName || email.split("@")[0] || "Collector";
                const avatarUrl =
                  fbUser.photoURL ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=000000&textColor=ffffff`;

                let user = await getCustomerFromFirestore(fbUser.uid);
                if (!user && email) {
                  user = await getCustomerFromFirestore(email);
                }

                if (!user) {
                  user = {
                    id: `cust_${fbUser.uid}`,
                    name,
                    email,
                    phone: fbUser.phoneNumber || "0770000000",
                    district: "Colombo",
                    city: "Colombo 07",
                    address: "Verified Google Account",
                    avatarUrl,
                    provider: "google",
                    createdAt: new Date().toISOString(),
                  };
                }

                await saveCustomerToFirestore(user);
                saveCustomer(user);
              }
            })
            .catch((err) => {
              console.warn("Google OAuth redirect error:", err);
            });

          // Synchronize session on Auth State Changes
          unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
            if (fbUser) {
              try {
                let profile = await getCustomerFromFirestore(fbUser.uid);
                if (!profile && fbUser.email) {
                  profile = await getCustomerFromFirestore(fbUser.email);
                }
                if (profile) {
                  saveCustomer(profile);
                }
              } catch (err) {
                console.warn("Error hydrating customer from Firestore:", err);
              }
            }
          });


        }
      } catch (error) { console.warn('Customer session could not be loaded', error); }
    };
    let started = false;
    const startSession = () => { if (!started) { started = true; void connect(); } };
    let hasSession = false;
    try { hasSession = Boolean(localStorage.getItem(STORAGE_KEY)); } catch {}
    // Returning collectors and account pages hydrate immediately. New visitors
    // can see and explore the storefront before the authentication SDK loads.
    if (hasSession || pathname.startsWith('/account')) startSession();
    else { window.addEventListener('pointerdown', startSession, { once: true }); window.addEventListener('keydown', startSession, { once: true }); }
    return () => { cancelled = true; unsubscribe?.(); window.removeEventListener('pointerdown', startSession); window.removeEventListener('keydown', startSession); };
  }, [pathname]);

  const login = async (
    phoneOrEmail: string,
    passwordOrOtp?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { isFirebaseConfigured, auth, signInWithEmailAndPassword, getCustomerFromFirestore, saveCustomerToFirestore } = await loadCustomerServices();
      const trimmed = phoneOrEmail.trim().toLowerCase();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

      // Method A: Firebase Auth Email & Password
      if (isFirebaseConfigured && auth && isEmail && passwordOrOtp) {
        try {
          const cred = await signInWithEmailAndPassword(auth, trimmed, passwordOrOtp);
          const fbUser = cred.user;

          let user = await getCustomerFromFirestore(fbUser.uid);
          if (!user && fbUser.email) {
            user = await getCustomerFromFirestore(fbUser.email);
          }

          if (!user) {
            user = {
              id: `cust_${fbUser.uid}`,
              name: fbUser.displayName || trimmed.split("@")[0],
              email: trimmed,
              phone: fbUser.phoneNumber || "0770000000",
              provider: "email",
              createdAt: new Date().toISOString(),
            };
            await saveCustomerToFirestore(user);
          }

          saveCustomer(user);
          return { success: true };
        } catch (firebaseErr: any) {
          console.warn("[Customer Sign-in Notice]", firebaseErr?.code || firebaseErr?.message);
          return {
            success: false,
            error: formatAuthError(firebaseErr),
          };
        }
      }

      // Method B: Match Demo Account
      const matchedDemo = DEMO_CUSTOMERS.find(
        (c) => c.phone === trimmed || c.email?.toLowerCase() === trimmed
      );
      if (matchedDemo) {
        saveCustomer(matchedDemo);
        await saveCustomerToFirestore(matchedDemo);
        return { success: true };
      }

      // Method C: Check Existing Firestore Customer by Email/Phone
      const firestoreCustomer = await getCustomerFromFirestore(trimmed);
      if (firestoreCustomer) {
        saveCustomer(firestoreCustomer);
        return { success: true };
      }

      // Method D: Phone number format session
      const isPhone = /^07[0-9]{8}$/.test(trimmed) || /^[0-9]{9,10}$/.test(trimmed);
      if (!isPhone && !isEmail) {
        return {
          success: false,
          error: "Please enter a valid Sri Lankan phone number (07XXXXXXXX) or email address.",
        };
      }

      const newUser: CustomerUser = {
        id: `cust_${Date.now()}`,
        name: isEmail ? trimmed.split("@")[0] : "Customer",
        phone: isPhone ? trimmed : "0770000000",
        email: isEmail ? trimmed : undefined,
        provider: isPhone ? "phone" : "email",
        createdAt: new Date().toISOString(),
      };

      saveCustomer(newUser);
      await saveCustomerToFirestore(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to sign in" };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { isFirebaseConfigured, auth, googleProvider, signInWithPopup, getCustomerFromFirestore, saveCustomerToFirestore } = await loadCustomerServices();
      if (!isFirebaseConfigured || !auth || !googleProvider) {
        return {
          success: false,
          error:
            "Firebase project credentials are required in .env.local to open Google OAuth. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is configured.",
        };
      }

      // Step 1: Open real Google OAuth popup
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = (fbUser.email || "").trim().toLowerCase();
      const name = fbUser.displayName || (email ? email.split("@")[0] : "Collector");
      const avatarUrl =
        fbUser.photoURL ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=000000&textColor=ffffff`;

      // Step 2: Check existing account in Firestore
      let user = await getCustomerFromFirestore(fbUser.uid);
      if (!user && email) {
        user = await getCustomerFromFirestore(email);
      }

      // Step 3: Auto-register if new customer
      if (!user) {
        user = {
          id: `cust_${fbUser.uid}`,
          name,
          email,
          phone: fbUser.phoneNumber || "0770000000",
          district: "Colombo",
          city: "Colombo 07",
          address: "Google Account",
          avatarUrl,
          provider: "google",
          createdAt: new Date().toISOString(),
        };
      } else {
        user = {
          ...user,
          name: name || user.name,
          avatarUrl: avatarUrl || user.avatarUrl,
          provider: "google",
        };
      }

      // Step 4: Persist to Firestore DB and establish session
      await saveCustomerToFirestore(user);
      saveCustomer(user);
      return { success: true };
    } catch (err: any) {
      console.warn("[Google Sign-in Notice]", err?.code || err?.message);
      return { success: false, error: formatAuthError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    address?: string;
    city?: string;
    district?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!data.name.trim()) {
        return { success: false, error: "Name is required." };
      }
      if (!data.phone.trim() || !/^07[0-9]{8}$/.test(data.phone.trim())) {
        return { success: false, error: "A valid Sri Lankan mobile phone (07XXXXXXXX) is required." };
      }

      const { isFirebaseConfigured, auth, createUserWithEmailAndPassword, updateFirebaseProfile, saveCustomerToFirestore } = await loadCustomerServices();
      // Register with Firebase Auth if Email + Password provided
      if (isFirebaseConfigured && auth && data.email && data.password) {
        try {
          const cred = await createUserWithEmailAndPassword(
            auth,
            data.email.trim(),
            data.password
          );
          const fbUser = cred.user;

          // Update display name
          await updateFirebaseProfile(fbUser, { displayName: data.name.trim() }).catch(() => {});

          const newUser: CustomerUser = {
            id: `cust_${fbUser.uid}`,
            name: data.name.trim(),
            phone: data.phone.trim(),
            email: data.email.trim(),
            address: data.address?.trim() || undefined,
            city: data.city?.trim() || undefined,
            district: data.district?.trim() || undefined,
            provider: "email",
            createdAt: new Date().toISOString(),
          };

          await saveCustomerToFirestore(newUser);
          saveCustomer(newUser);
          return { success: true };
        } catch (firebaseErr: any) {
          console.warn("[Customer Registration Notice]", firebaseErr?.code || firebaseErr?.message);
          return {
            success: false,
            error: formatAuthError(firebaseErr),
          };
        }
      }

      // Standard Firestore Customer Creation (e.g. Phone-first flow)
      const newUser: CustomerUser = {
        id: `cust_${Date.now()}`,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || undefined,
        address: data.address?.trim() || undefined,
        city: data.city?.trim() || undefined,
        district: data.district?.trim() || undefined,
        provider: "phone",
        createdAt: new Date().toISOString(),
      };

      await saveCustomerToFirestore(newUser);
      saveCustomer(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { isFirebaseConfigured, auth, sendPasswordResetEmail } = await loadCustomerServices();
      if (!isFirebaseConfigured || !auth) return { success: false, error: "Firebase Authentication is not configured." };
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      console.error("Password reset error:", err);
      return { success: false, error: err?.message || "Failed to send reset email." };
    }
  };

  const updateProfile = async (
    data: Partial<CustomerUser>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!customer) return { success: false, error: "Not logged in" };
    const updated: CustomerUser = {
      ...customer,
      ...data,
    };
    const { saveCustomerToFirestore } = await loadCustomerServices();
    await saveCustomerToFirestore(updated);
    saveCustomer(updated);
    return { success: true };
  };

  const logout = () => {
    saveCustomer(null);
    void loadCustomerServices().then(({ auth, isFirebaseConfigured, firebaseSignOut }) => {
      if (auth && isFirebaseConfigured) return firebaseSignOut(auth);
    }).catch(error => console.warn('Customer signout could not complete', error));
  };

  const quickDemoLogin = (presetIndex = 0) => {
    const demo = DEMO_CUSTOMERS[presetIndex] || DEMO_CUSTOMERS[0];
    saveCustomer(demo);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        loginWithGoogle,
        register,
        resetPassword,
        updateProfile,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return ctx;
}
