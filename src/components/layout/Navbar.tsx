"use client";

import React from "react";
import {
  GraduationCap,
  ShieldCheck,
  Wallet,
  BookOpen,
  UserCheck,
  Bell,
  Search,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Role } from "@/types";

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  unreadCount = 3,
  onOpenNotifications,
}) => {
  const roles: { id: Role; label: string; icon: any; user: string; color: string }[] = [
    {
      id: "ADMIN",
      label: "Direction / Proviseur",
      icon: ShieldCheck,
      user: "Dr. Marcellin KPADONOU",
      color: "bg-sage-600 text-white",
    },
    {
      id: "ACCOUNTANT",
      label: "Économat / Caisse",
      icon: Wallet,
      user: "Mme Clarisse HOUNDÉTÉ",
      color: "bg-marine-600 text-white",
    },
    {
      id: "TEACHER",
      label: "Professeur Titulaire",
      icon: BookOpen,
      user: "M. Romaric GBAGUIDI (Maths)",
      color: "bg-amber-600 text-white",
    },
    {
      id: "PARENT",
      label: "Espace Parent d'Élève",
      icon: UserCheck,
      user: "M. Toussaint DOSSOU",
      color: "bg-coral-600 text-white",
    },
  ];

  const activeRoleObj = roles.find((r) => r.id === currentRole) || roles[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sage-800 to-sage-600 flex items-center justify-center text-white shadow-md shadow-sage-900/10 ring-2 ring-sage-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  School Manager<span className="text-sage-600">-King</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-sage-700 border border-sage-200/60">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  SaaS 2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[210px] sm:max-w-xs">
                Complexe Scolaire Les Étoiles • Cotonou (Bénin)
              </p>
            </div>
          </div>

          {/* Academic Year Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-sage-600" />
            <span>Année 2025-2026</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Right Section: Role Switcher & Notifications & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Notification Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Centre de notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500"></span>
                </span>
              )}
            </button>

            {/* Interactive RBAC Switcher Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-all text-left">
                <div
                  className={`w-7 h-7 rounded-lg ${activeRoleObj.color} flex items-center justify-center text-xs font-bold shadow-sm`}
                >
                  {activeRoleObj.label.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {activeRoleObj.label}
                  </p>
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {activeRoleObj.user}
                  </p>
                </div>
                <span className="text-slate-400 text-xs ml-1">▼</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Changer de Rôle (Simulation RBAC)
                  </p>
                </div>
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = r.id === currentRole;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onRoleChange(r.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-sage-50 text-sage-900 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md ${r.color} flex items-center justify-center text-white shrink-0`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {r.label}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{r.user}</p>
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sage-600"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
