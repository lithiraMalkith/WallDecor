"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  UserPlus,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { ROLE_LABELS, BUILT_IN_ROLE_PERMISSIONS } from "@/lib/permissions";
import type { BuiltInRole } from "@/types";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: BuiltInRole;
  isActive: boolean;
}

const INITIAL_STAFF: StaffUser[] = [
  {
    id: "u_1",
    name: "Lithira Gunasekara",
    email: "owner@ceylonwalldecor.lk",
    phone: "078 2518184",
    role: "superadmin",
    isActive: true,
  },
  {
    id: "u_2",
    name: "Anura Perera",
    email: "manager@ceylonwalldecor.lk",
    phone: "077 1234567",
    role: "manager",
    isActive: true,
  },
  {
    id: "u_3",
    name: "Kavindi Silva",
    email: "fulfillment@ceylonwalldecor.lk",
    phone: "071 9876543",
    role: "order_staff",
    isActive: true,
  },
  {
    id: "u_4",
    name: "Dinuka Fernando",
    email: "editor@ceylonwalldecor.lk",
    phone: "076 5554321",
    role: "content_editor",
    isActive: true,
  },
];

export default function AdminUsersPage() {
  const [staff, setStaff] = useState<StaffUser[]>(INITIAL_STAFF);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<BuiltInRole>("order_staff");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const newUser: StaffUser = {
      id: `u_${Date.now()}`,
      name,
      email,
      phone: phone || "077 0000000",
      role,
      isActive: true,
    };
    setStaff((prev) => [...prev, newUser]);
    setModalOpen(false);
    setName("");
    setEmail("");
    setPhone("");
  };

  const handleToggle = (id: string) => {
    setStaff((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)),
    );
  };

  const roleColors: Record<BuiltInRole, string> = {
    superadmin: "bg-brand-gold/10 text-brand-gold border-brand-gold/30",
    manager: "bg-brand-gold/10 text-brand-gold border-brand-gold/30",
    order_staff: "bg-black/5 text-brand-text border-black/10",
    content_editor: "bg-black/5 text-brand-text border-black/10",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-text font-serif">
            Staff & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Manage studio team access with strict permission boundaries enforced
            on server and client
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-semibold text-xs sm:text-sm transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-xl">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-brand-text">
            Active Team Accounts
          </h2>
          <span className="text-xs text-brand-muted">
            {staff.length} staff members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Assigned Role</th>
                <th>Phone Contact</th>
                <th>Account Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-brand-surface-hover/70 transition-colors"
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 flex items-center justify-center font-bold text-xs shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-brand-text text-sm block">
                          {user.name}
                        </span>
                        <span className="text-xs text-brand-muted">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${roleColors[user.role]}`}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>

                  <td>
                    <span className="text-xs font-mono text-brand-text">
                      {user.phone}
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() => handleToggle(user.id)}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        user.isActive
                          ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/30"
                          : "bg-black/5 text-brand-muted border border-black/10"
                      }`}
                    >
                      {user.isActive ? "Active" : "Deactivated"}
                    </button>
                  </td>

                  <td className="text-right">
                    <span className="text-xs text-brand-muted font-mono">
                      {user.role === "superadmin"
                        ? "Owner / Unrestricted"
                        : `${BUILT_IN_ROLE_PERMISSIONS[user.role].length} permissions`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Role Permissions Matrix Reference */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-text flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-gold" />
          <span>Role Permissions Matrix (Ceylon Wall Decor Standard)</span>
        </h2>
        <p className="text-xs text-brand-muted">
          Staff roles restrict view and mutation capabilities. Order staff can
          only move fulfillment statuses and cannot edit prices or view revenue.
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border border-brand-border">
            <thead className="bg-brand-bg text-brand-muted">
              <tr>
                <th className="p-3">Module / Capability</th>
                <th className="p-3 text-center">Owner (Superadmin)</th>
                <th className="p-3 text-center">Store Manager</th>
                <th className="p-3 text-center">Order Staff</th>
                <th className="p-3 text-center">Content Editor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              <tr>
                <td className="p-3 font-medium text-brand-text">
                  Dashboard & Revenue Analytics
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓ Full
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓ Full
                </td>
                <td className="p-3 text-center text-brand-muted">Orders only</td>
                <td className="p-3 text-center text-brand-muted">Catalog only</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-brand-text">
                  Artwork Catalog & Pricing Editing
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓
                </td>
                <td className="p-3 text-center text-brand-muted">
                  ✕ No Access
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-brand-text">
                  7-Step Order Fulfillment Workflow
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓ Fulfillment
                </td>
                <td className="p-3 text-center text-brand-muted">
                  ✕ No Access
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-brand-text">
                  Custom Design Inbox & Quoting
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓
                </td>
                <td className="p-3 text-center text-brand-muted">✕</td>
                <td className="p-3 text-center text-brand-muted">✕</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-brand-text">
                  Staff Accounts & System Settings
                </td>
                <td className="p-3 text-center text-brand-gold font-bold">
                  ✓ Owner Only
                </td>
                <td className="p-3 text-center text-brand-muted">✕</td>
                <td className="p-3 text-center text-brand-muted">✕</td>
                <td className="p-3 text-center text-brand-muted">✕</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-bold text-brand-text">
                Invite Team Member
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-brand-muted hover:text-brand-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ruwanthi Perera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="staff@ceylonwalldecor.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Phone (WhatsApp)
                </label>
                <input
                  type="text"
                  placeholder="077 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1.5">
                  Role Assignment
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as BuiltInRole)}
                  className="form-input"
                >
                  <option value="order_staff">Order Fulfillment Staff</option>
                  <option value="content_editor">
                    Content & Catalog Editor
                  </option>
                  <option value="manager">Store Manager</option>
                  <option value="superadmin">Store Owner (Super Admin)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-lg border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-brand-bg text-xs font-semibold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
