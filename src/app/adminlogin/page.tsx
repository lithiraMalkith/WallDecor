"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import type { BuiltInRole } from "@/types";

function AdminLoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both staff email and password.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        router.push("/admin");
      } else {
        setErrorMsg(res.error || "Invalid credentials. Please verify your staff email and password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FDFCFC] text-[#000000] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-[0.1em] text-[#777169] mb-1">
            Ceylon Wall Decor
          </p>
          <h1 className="text-2xl font-light tracking-[-0.02em] text-[#000000]">
            Staff Sign In
          </h1>
        </div>

        {/* Card */}
        <div className="bg-[#FFFFFF] border border-[#EBE8E4] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {errorMsg && (
            <div className="mb-5 px-3.5 py-2.5 rounded-lg border border-[#EBE8E4] bg-[#F5F3F1] text-xs text-[#000000] text-center leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                Staff Email
              </label>
              <input
                type="email"
                placeholder="staff@ceylonwalldecor.lk"
                value={email}
                onChange={(e) => {
                  setErrorMsg("");
                  setEmail(e.target.value);
                }}
                className="w-full h-10 px-3.5 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] placeholder:text-[#A09A92] transition-colors"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setErrorMsg("");
                  setPassword(e.target.value);
                }}
                className="w-full h-10 px-3.5 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] placeholder:text-[#A09A92] transition-colors"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-full bg-[#000000] text-white hover:bg-[#222222] text-xs font-normal transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Return link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-[#777169] hover:text-[#000000] transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AuthProvider>
      <AdminLoginContent />
    </AuthProvider>
  );
}
