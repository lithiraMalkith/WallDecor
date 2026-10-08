"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { GoogleSignInButton } from "@/components/google-sign-in";

const SRI_LANKA_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Ratnapura",
  "Kegalle",
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { customer, login, register } = useCustomerAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("Colombo");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      router.push(redirectUrl);
    }
  }, [customer, redirectUrl, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || "Unable to sign in. Please verify your details.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await register({
      name,
      phone,
      email: email || undefined,
      password: password || undefined,
      district: district || undefined,
    });
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || "Unable to create account. Please verify your details.");
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FDFCFC] text-[#000000] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        {/* Title */}
        <h1 className="text-2xl font-light tracking-[-0.02em] text-[#000000] text-center mb-6">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>

        {/* Card */}
        <div className="bg-[#FFFFFF] border border-[#EBE8E4] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Graceful Minimal Error Notice */}
          {error && (
            <div className="mb-5 px-3.5 py-2.5 rounded-lg border border-[#EBE8E4] bg-[#F5F3F1] text-xs text-[#000000] text-center leading-relaxed">
              {error}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex p-1 rounded-full border border-[#EBE8E4] bg-[#F5F3F1] mb-6">
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode("login");
              }}
              className={`flex-1 py-1.5 text-xs rounded-full transition-all ${mode === "login"
                ? "bg-white text-black font-medium border border-[#EBE8E4] shadow-xs"
                : "text-[#777169] hover:text-black"
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode("register");
              }}
              className={`flex-1 py-1.5 text-xs rounded-full transition-all ${mode === "register"
                ? "bg-white text-black font-medium border border-[#EBE8E4] shadow-xs"
                : "text-[#777169] hover:text-black"
                }`}
            >
              Register
            </button>
          </div>

          {/* Google Auth Button (No icons, minimal text) */}
          <div className="mb-6">
            <GoogleSignInButton
              redirectUrl={redirectUrl}
              buttonText={mode === "login" ? "Continue with Google" : "Register with Google"}
            />

            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EBE8E4]" />
              </div>
              <span className="relative bg-[#FFFFFF] px-3 text-[10px] uppercase tracking-widest text-[#777169]">
                or
              </span>
            </div>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                  Email or Mobile Phone
                </label>
                <input
                  type="text"
                  required

                  value={identifier}
                  onChange={(e) => {
                    setError("");
                    setIdentifier(e.target.value);
                  }}
                  className="w-full h-10 px-3.5 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] placeholder:text-[#A09A92] transition-colors"
                />
              </div>

              {identifier.includes("@") && (
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setError("");
                      setPassword(e.target.value);
                    }}
                    className="w-full h-10 px-3.5 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] placeholder:text-[#A09A92] transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-full bg-[#000000] text-white hover:bg-[#222222] text-xs font-normal transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setError("");
                    setName(e.target.value);
                  }}
                  className="w-full h-10 px-3.5 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] placeholder:text-[#A09A92] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  required
                  pattern="07[0-9]{8}"
                  value={phone}
                  onChange={(e) => {
                    setError("");
                    setPhone(e.target.value);
                  }}
                  className="w-full h-10 px-3.5 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] placeholder:text-[#A09A92] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setError("");
                    setEmail(e.target.value);
                  }}
                  className="w-full h-10 px-3.5 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] placeholder:text-[#A09A92] transition-colors"
                />
              </div>

              {email && (
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => {
                      setError("");
                      setPassword(e.target.value);
                    }}
                    className="w-full h-10 px-3.5 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] placeholder:text-[#A09A92] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-[0.05em] text-[#777169] mb-1.5">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#EBE8E4] focus:border-[#000000] focus:outline-none bg-white text-xs text-[#000000] transition-colors"
                >
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-full bg-[#000000] text-white hover:bg-[#222222] text-xs font-normal transition-all disabled:opacity-50 cursor-pointer mt-1"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-[#777169] hover:text-[#000000] transition-colors">
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] grid place-items-center text-xs text-[#777169]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
